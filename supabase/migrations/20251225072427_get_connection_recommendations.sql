-- =====================================================
-- RPC FUNCTION: get_connection_recommendations
-- ADIN Intelligence - Smart connection recommendations
-- =====================================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS get_connection_recommendations(uuid, int);

-- Create the connection recommendations function
CREATE OR REPLACE FUNCTION get_connection_recommendations(
  p_user_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,
  location TEXT,
  profession TEXT,
  match_score NUMERIC,
  shared_skills_count INT,
  shared_interests_count INT,
  mutual_connections_count INT,
  same_heritage BOOLEAN,
  same_region BOOLEAN,
  match_reasons TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_profile RECORD;
BEGIN
  -- Get current user's profile data for comparison
  SELECT
    p.id,
    COALESCE(p.skills, ARRAY[]::TEXT[]) as skills,
    COALESCE(p.interests, ARRAY[]::TEXT[]) as interests,
    p.country_of_origin,
    p.diaspora_origin,
    p.current_country,
    p.location
  INTO current_user_profile
  FROM profiles p
  WHERE p.id = p_user_id;

  -- If user not found, return empty result
  IF current_user_profile.id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH
  -- Get users already connected or with pending connections
  connected_users AS (
    SELECT requester_id AS connected_id FROM connections WHERE recipient_id = p_user_id
    UNION
    SELECT recipient_id AS connected_id FROM connections WHERE requester_id = p_user_id
  ),
  -- Get blocked users (both directions)
  blocked AS (
    SELECT blocked_id AS blocked_user FROM blocked_users WHERE blocker_id = p_user_id
    UNION
    SELECT blocker_id AS blocked_user FROM blocked_users WHERE blocked_id = p_user_id
  ),
  -- Get current user's connections for mutual connection calculation
  user_connections AS (
    SELECT
      CASE
        WHEN c.requester_id = p_user_id THEN c.recipient_id
        ELSE c.requester_id
      END AS friend_id
    FROM connections c
    WHERE (c.requester_id = p_user_id OR c.recipient_id = p_user_id)
      AND c.status = 'accepted'
  ),
  -- Calculate scores for each candidate user
  scored_users AS (
    SELECT
      p.id AS candidate_id,
      p.username,
      p.full_name,
      p.avatar_url,
      p.headline,
      p.location,
      p.profession,
      COALESCE(p.skills, ARRAY[]::TEXT[]) AS candidate_skills,
      COALESCE(p.interests, ARRAY[]::TEXT[]) AS candidate_interests,
      p.country_of_origin AS candidate_heritage,
      p.current_country AS candidate_country,
      -- Calculate shared skills count
      COALESCE(array_length(
        ARRAY(
          SELECT LOWER(UNNEST(current_user_profile.skills))
          INTERSECT
          SELECT LOWER(UNNEST(COALESCE(p.skills, ARRAY[]::TEXT[])))
        ), 1
      ), 0) AS shared_skills,
      -- Calculate shared interests count
      COALESCE(array_length(
        ARRAY(
          SELECT LOWER(UNNEST(current_user_profile.interests))
          INTERSECT
          SELECT LOWER(UNNEST(COALESCE(p.interests, ARRAY[]::TEXT[])))
        ), 1
      ), 0) AS shared_interests,
      -- Check same heritage (country of origin or diaspora origin)
      (
        (p.country_of_origin IS NOT NULL AND current_user_profile.country_of_origin IS NOT NULL
          AND LOWER(p.country_of_origin) = LOWER(current_user_profile.country_of_origin))
        OR
        (p.diaspora_origin IS NOT NULL AND current_user_profile.diaspora_origin IS NOT NULL
          AND LOWER(p.diaspora_origin) = LOWER(current_user_profile.diaspora_origin))
      ) AS has_same_heritage,
      -- Check same region (current country)
      (
        p.current_country IS NOT NULL
        AND current_user_profile.current_country IS NOT NULL
        AND LOWER(p.current_country) = LOWER(current_user_profile.current_country)
      ) AS has_same_region
    FROM profiles p
    WHERE p.id != p_user_id
      -- Exclude already connected users
      AND p.id NOT IN (SELECT connected_id FROM connected_users)
      -- Exclude blocked users
      AND p.id NOT IN (SELECT blocked_user FROM blocked)
      -- Only include public profiles or those with visible settings
      AND COALESCE(p.is_public, true) = true
  ),
  -- Calculate mutual connections for each candidate
  mutual_counts AS (
    SELECT
      su.candidate_id,
      COUNT(DISTINCT uc.friend_id) AS mutual_count
    FROM scored_users su
    LEFT JOIN connections c ON (
      (c.requester_id = su.candidate_id OR c.recipient_id = su.candidate_id)
      AND c.status = 'accepted'
    )
    LEFT JOIN user_connections uc ON (
      (c.requester_id = su.candidate_id AND c.recipient_id = uc.friend_id)
      OR (c.recipient_id = su.candidate_id AND c.requester_id = uc.friend_id)
    )
    GROUP BY su.candidate_id
  ),
  -- Final scoring with weights from PRD:
  -- Shared skills: 0.25, Shared interests: 0.25, Heritage: 0.2, Mutual connections: 0.2, Region: 0.1
  final_scores AS (
    SELECT
      su.candidate_id,
      su.username,
      su.full_name,
      su.avatar_url,
      su.headline,
      su.location,
      su.profession,
      su.shared_skills,
      su.shared_interests,
      COALESCE(mc.mutual_count, 0)::INT AS mutuals,
      su.has_same_heritage,
      su.has_same_region,
      -- Calculate weighted score (0-100 scale)
      ROUND(
        (
          -- Skills score: 25 points max (normalized by min of 5 shared skills)
          LEAST(su.shared_skills::NUMERIC / 5.0, 1.0) * 25.0
          +
          -- Interests score: 25 points max (normalized by min of 5 shared interests)
          LEAST(su.shared_interests::NUMERIC / 5.0, 1.0) * 25.0
          +
          -- Heritage score: 20 points if same heritage
          CASE WHEN su.has_same_heritage THEN 20.0 ELSE 0.0 END
          +
          -- Mutual connections score: 20 points max (normalized by 10 mutuals)
          LEAST(COALESCE(mc.mutual_count, 0)::NUMERIC / 10.0, 1.0) * 20.0
          +
          -- Region score: 10 points if same region
          CASE WHEN su.has_same_region THEN 10.0 ELSE 0.0 END
        ),
        1
      ) AS calculated_score,
      -- Build match reasons array
      ARRAY_REMOVE(ARRAY[
        CASE WHEN su.shared_skills > 0
          THEN su.shared_skills || ' shared skill' || CASE WHEN su.shared_skills > 1 THEN 's' ELSE '' END
          ELSE NULL END,
        CASE WHEN su.shared_interests > 0
          THEN su.shared_interests || ' shared interest' || CASE WHEN su.shared_interests > 1 THEN 's' ELSE '' END
          ELSE NULL END,
        CASE WHEN su.has_same_heritage THEN 'Same heritage' ELSE NULL END,
        CASE WHEN COALESCE(mc.mutual_count, 0) > 0
          THEN mc.mutual_count || ' mutual connection' || CASE WHEN mc.mutual_count > 1 THEN 's' ELSE '' END
          ELSE NULL END,
        CASE WHEN su.has_same_region THEN 'Same region' ELSE NULL END
      ], NULL) AS reasons
    FROM scored_users su
    LEFT JOIN mutual_counts mc ON su.candidate_id = mc.candidate_id
    -- Only include users with at least some match criteria
    WHERE su.shared_skills > 0
       OR su.shared_interests > 0
       OR su.has_same_heritage
       OR su.has_same_region
       OR COALESCE(mc.mutual_count, 0) > 0
  )
  SELECT
    fs.candidate_id,
    fs.username,
    fs.full_name,
    fs.avatar_url,
    fs.headline,
    fs.location,
    fs.profession,
    fs.calculated_score,
    fs.shared_skills,
    fs.shared_interests,
    fs.mutuals,
    fs.has_same_heritage,
    fs.has_same_region,
    fs.reasons
  FROM final_scores fs
  ORDER BY fs.calculated_score DESC, fs.mutuals DESC, fs.shared_skills DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_connection_recommendations(uuid, int) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION get_connection_recommendations IS 'Returns smart connection recommendations based on shared skills (25%), interests (25%), heritage (20%), mutual connections (20%), and region (10%).';
