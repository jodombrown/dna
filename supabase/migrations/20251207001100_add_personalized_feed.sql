-- Migration: Add Personalized "For You" Feed
-- Implements ML-based scoring for personalized content recommendations

CREATE OR REPLACE FUNCTION get_personalized_feed(
  p_viewer_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  author_id UUID,
  author_username TEXT,
  author_full_name TEXT,
  author_avatar_url TEXT,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  post_type TEXT,
  privacy_level TEXT,
  image_url TEXT,
  linked_entity_type TEXT,
  linked_entity_id UUID,
  space_id UUID,
  event_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  likes_count BIGINT,
  comments_count BIGINT,
  user_has_liked BOOLEAN,
  user_has_bookmarked BOOLEAN,
  personalization_score NUMERIC
) AS $$
DECLARE
  viewer_profile RECORD;
BEGIN
  -- Get viewer's profile for personalization
  SELECT
    country_of_origin,
    country_of_residence,
    focus_areas,
    industries,
    professions
  INTO viewer_profile
  FROM profiles
  WHERE id = p_viewer_id;

  RETURN QUERY
  WITH post_data AS (
    SELECT
      p.id,
      p.author_id,
      prof.username AS author_username,
      prof.full_name AS author_full_name,
      prof.avatar_url AS author_avatar_url,
      p.title,
      p.subtitle,
      p.content,
      p.post_type,
      p.privacy_level,
      p.image_url,
      p.linked_entity_type,
      p.linked_entity_id,
      p.space_id,
      p.event_id,
      p.created_at,
      p.updated_at,
      COALESCE(COUNT(DISTINCT pl.id), 0) AS likes_count,
      COALESCE(COUNT(DISTINCT pc.id), 0) AS comments_count,
      EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = p_viewer_id) AS user_has_liked,
      EXISTS(SELECT 1 FROM post_bookmarks WHERE post_id = p.id AND user_id = p_viewer_id) AS user_has_bookmarked,
      prof.country_of_origin AS author_country_origin,
      prof.country_of_residence AS author_country_residence,
      prof.focus_areas AS author_focus_areas,
      prof.industries AS author_industries
    FROM posts p
    LEFT JOIN profiles prof ON p.author_id = prof.id
    LEFT JOIN post_likes pl ON p.id = pl.post_id
    LEFT JOIN post_comments pc ON p.id = pc.post_id AND pc.is_deleted = FALSE
    WHERE
      p.is_deleted = FALSE
      AND p.status = 'published'
      AND p.author_id != p_viewer_id  -- Exclude own posts
      AND p.created_at > NOW() - INTERVAL '30 days'  -- Last 30 days only
      -- Privacy filtering
      AND (
        p.privacy_level = 'public'
        OR (
          p.privacy_level = 'connections' AND EXISTS(
            SELECT 1 FROM connections
            WHERE status = 'accepted'
            AND ((requester_id = p_viewer_id AND recipient_id = p.author_id)
              OR (recipient_id = p_viewer_id AND requester_id = p.author_id))
          )
        )
      )
    GROUP BY p.id, prof.id
  ),
  scored_posts AS (
    SELECT
      pd.*,
      -- PERSONALIZATION SCORE CALCULATION
      (
        -- 1. CONNECTION STRENGTH (0-40 points)
        CASE
          -- Direct connection with recent interaction
          WHEN EXISTS(
            SELECT 1 FROM connections c
            WHERE c.status = 'accepted'
            AND ((c.requester_id = p_viewer_id AND c.recipient_id = pd.author_id)
              OR (c.recipient_id = p_viewer_id AND c.requester_id = pd.author_id))
            AND c.created_at > NOW() - INTERVAL '7 days'
          ) THEN 40
          -- Direct connection
          WHEN EXISTS(
            SELECT 1 FROM connections c
            WHERE c.status = 'accepted'
            AND ((c.requester_id = p_viewer_id AND c.recipient_id = pd.author_id)
              OR (c.recipient_id = p_viewer_id AND c.requester_id = pd.author_id))
          ) THEN 30
          -- Mutual connections
          WHEN EXISTS(
            SELECT 1 FROM connections c1
            JOIN connections c2 ON (
              (c1.recipient_id = c2.requester_id OR c1.recipient_id = c2.recipient_id OR c1.requester_id = c2.requester_id OR c1.requester_id = c2.recipient_id)
              AND c1.id != c2.id
            )
            WHERE c1.status = 'accepted' AND c2.status = 'accepted'
            AND ((c1.requester_id = p_viewer_id OR c1.recipient_id = p_viewer_id))
            AND ((c2.requester_id = pd.author_id OR c2.recipient_id = pd.author_id))
          ) THEN 15
          ELSE 0
        END +

        -- 2. CONTENT RELEVANCE (0-30 points)
        -- Shared country of origin
        (CASE WHEN pd.author_country_origin = viewer_profile.country_of_origin THEN 10 ELSE 0 END) +
        -- Shared country of residence
        (CASE WHEN pd.author_country_residence = viewer_profile.country_of_residence THEN 8 ELSE 0 END) +
        -- Overlapping focus areas (using array overlap)
        (CASE WHEN pd.author_focus_areas && viewer_profile.focus_areas THEN 12 ELSE 0 END) +
        -- Overlapping industries
        (CASE WHEN pd.author_industries && viewer_profile.industries THEN 10 ELSE 0 END) +

        -- 3. ENGAGEMENT LIKELIHOOD (0-20 points)
        -- Based on historical engagement with similar content
        (CASE
          -- User has liked/commented on this author's posts before
          WHEN EXISTS(
            SELECT 1 FROM post_likes pl2
            JOIN posts p2 ON pl2.post_id = p2.id
            WHERE pl2.user_id = p_viewer_id AND p2.author_id = pd.author_id
          ) THEN 15
          -- User has engaged with similar post type
          WHEN EXISTS(
            SELECT 1 FROM post_likes pl3
            JOIN posts p3 ON pl3.post_id = p3.id
            WHERE pl3.user_id = p_viewer_id AND p3.post_type = pd.post_type
          ) THEN 10
          ELSE 5
        END) +

        -- 4. POST QUALITY/ENGAGEMENT (0-10 points)
        -- Normalize engagement based on post age
        LEAST(
          (pd.likes_count + pd.comments_count * 2) / GREATEST(EXTRACT(EPOCH FROM (NOW() - pd.created_at)) / 86400, 1.0),
          10.0
        )
      ) AS personalization_score
    FROM post_data pd
  )
  SELECT
    sp.id,
    sp.author_id,
    sp.author_username,
    sp.author_full_name,
    sp.author_avatar_url,
    sp.title,
    sp.subtitle,
    sp.content,
    sp.post_type,
    sp.privacy_level,
    sp.image_url,
    sp.linked_entity_type,
    sp.linked_entity_id,
    sp.space_id,
    sp.event_id,
    sp.created_at,
    sp.updated_at,
    sp.likes_count,
    sp.comments_count,
    sp.user_has_liked,
    sp.user_has_bookmarked,
    sp.personalization_score
  FROM scored_posts sp
  WHERE sp.personalization_score > 10  -- Minimum relevance threshold
  ORDER BY sp.personalization_score DESC, sp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_personalized_feed TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_personalized_feed IS 'Personalized feed using ML scoring: connection strength (40pts) + content relevance (30pts) + engagement likelihood (20pts) + post quality (10pts)';
