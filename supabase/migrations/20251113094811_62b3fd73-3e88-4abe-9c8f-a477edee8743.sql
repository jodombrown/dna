-- Enhance discover_members to exclude blocked users and low-completion profiles
CREATE OR REPLACE FUNCTION public.discover_members(
  p_current_user_id uuid,
  p_focus_areas text[] DEFAULT NULL::text[],
  p_regional_expertise text[] DEFAULT NULL::text[],
  p_industries text[] DEFAULT NULL::text[],
  p_country_of_origin text DEFAULT NULL::text,
  p_location_country text DEFAULT NULL::text,
  p_skills text[] DEFAULT NULL::text[],
  p_search_query text DEFAULT NULL::text,
  p_sort_by text DEFAULT 'match'::text,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  full_name text,
  username text,
  avatar_url text,
  banner_url text,
  banner_type text,
  banner_gradient text,
  banner_overlay boolean,
  headline text,
  profession text,
  location text,
  country_of_origin text,
  focus_areas text[],
  regional_expertise text[],
  industries text[],
  skills text[],
  profile_completion_percentage integer,
  match_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH current_user_profile AS (
    SELECT 
      p.focus_areas as user_focus,
      p.regional_expertise as user_region,
      p.industries as user_industries,
      p.skills as user_skills,
      p.country_of_origin as user_country,
      p.location_country as user_location
    FROM profiles p
    WHERE p.id = p_current_user_id
  ),
  scored_profiles AS (
    SELECT
      p.*,
      (
        -- Shared focus areas (20 points max)
        CASE 
          WHEN p_focus_areas IS NULL THEN
            CASE 
              WHEN cardinality(p.focus_areas & (SELECT user_focus FROM current_user_profile)) >= 3 THEN 20
              WHEN cardinality(p.focus_areas & (SELECT user_focus FROM current_user_profile)) = 2 THEN 14
              WHEN cardinality(p.focus_areas & (SELECT user_focus FROM current_user_profile)) = 1 THEN 7
              ELSE 0
            END
          WHEN cardinality(p.focus_areas & p_focus_areas) >= 3 THEN 20
          WHEN cardinality(p.focus_areas & p_focus_areas) = 2 THEN 14
          WHEN cardinality(p.focus_areas & p_focus_areas) = 1 THEN 7
          ELSE 0
        END +
        
        -- Shared regional expertise (15 points max)
        CASE 
          WHEN p_regional_expertise IS NULL THEN
            CASE 
              WHEN cardinality(p.regional_expertise & (SELECT user_region FROM current_user_profile)) >= 2 THEN 15
              WHEN cardinality(p.regional_expertise & (SELECT user_region FROM current_user_profile)) = 1 THEN 8
              ELSE 0
            END
          WHEN cardinality(p.regional_expertise & p_regional_expertise) >= 2 THEN 15
          WHEN cardinality(p.regional_expertise & p_regional_expertise) = 1 THEN 8
          ELSE 0
        END +
        
        -- Shared industries (15 points max)
        CASE 
          WHEN p_industries IS NULL THEN
            CASE 
              WHEN cardinality(p.industries & (SELECT user_industries FROM current_user_profile)) >= 2 THEN 15
              WHEN cardinality(p.industries & (SELECT user_industries FROM current_user_profile)) = 1 THEN 8
              ELSE 0
            END
          WHEN cardinality(p.industries & p_industries) >= 2 THEN 15
          WHEN cardinality(p.industries & p_industries) = 1 THEN 8
          ELSE 0
        END +
        
        -- Shared skills (10 points max)
        CASE 
          WHEN p_skills IS NULL THEN
            CASE 
              WHEN cardinality(p.skills & (SELECT user_skills FROM current_user_profile)) >= 3 THEN 10
              WHEN cardinality(p.skills & (SELECT user_skills FROM current_user_profile)) >= 2 THEN 6
              WHEN cardinality(p.skills & (SELECT user_skills FROM current_user_profile)) = 1 THEN 3
              ELSE 0
            END
          WHEN cardinality(p.skills & p_skills) >= 3 THEN 10
          WHEN cardinality(p.skills & p_skills) >= 2 THEN 6
          WHEN cardinality(p.skills & p_skills) = 1 THEN 3
          ELSE 0
        END +
        
        -- Same country of origin (20 points)
        CASE 
          WHEN p.country_of_origin = (SELECT user_country FROM current_user_profile) THEN 20
          ELSE 0
        END +
        
        -- Same location (10 points)
        CASE 
          WHEN p.location_country = (SELECT user_location FROM current_user_profile) THEN 10
          ELSE 0
        END +
        
        -- Profile completeness bonus (10 points)
        CASE 
          WHEN p.profile_completion_percentage >= 80 THEN 10
          ELSE 0
        END
      )::int AS match_score
      
    FROM profiles p
    INNER JOIN auth.users au ON au.id = p.id  -- Only users with valid auth accounts
    WHERE
      p.id != p_current_user_id
      AND p.is_public = true
      -- CRITICAL: Exclude users with profile strength < 40%
      AND COALESCE(p.profile_completion_percentage, 0) >= 40
      -- CRITICAL: Exclude blocked relationships
      AND NOT EXISTS (
        SELECT 1 FROM blocked_users bu
        WHERE (bu.blocker_id = p_current_user_id AND bu.blocked_id = p.id)
           OR (bu.blocker_id = p.id AND bu.blocked_id = p_current_user_id)
      )
      -- Apply filters
      AND (p_focus_areas IS NULL OR p.focus_areas && p_focus_areas)
      AND (p_regional_expertise IS NULL OR p.regional_expertise && p_regional_expertise)
      AND (p_industries IS NULL OR p.industries && p_industries)
      AND (p_skills IS NULL OR p.skills && p_skills)
      AND (p_country_of_origin IS NULL OR p.country_of_origin = p_country_of_origin)
      AND (p_location_country IS NULL OR p.location_country = p_location_country)
      AND (
        p_search_query IS NULL OR
        p.full_name ILIKE '%' || p_search_query || '%' OR
        p.headline ILIKE '%' || p_search_query || '%' OR
        p.username ILIKE '%' || p_search_query || '%' OR
        p.bio ILIKE '%' || p_search_query || '%'
      )
  )
  SELECT 
    sp.id,
    sp.full_name,
    sp.username,
    sp.avatar_url,
    sp.banner_url,
    sp.banner_type,
    sp.banner_gradient,
    sp.banner_overlay,
    sp.headline,
    sp.profession,
    sp.location,
    sp.country_of_origin,
    sp.focus_areas,
    sp.regional_expertise,
    sp.industries,
    sp.skills,
    sp.profile_completion_percentage,
    sp.match_score
  FROM scored_profiles sp
  ORDER BY 
    CASE 
      WHEN p_sort_by = 'match' THEN sp.match_score
      WHEN p_sort_by = 'completion' THEN sp.profile_completion_percentage
      ELSE 0
    END DESC,
    CASE 
      WHEN p_sort_by = 'recent' THEN sp.created_at
      ELSE NULL
    END DESC,
    CASE 
      WHEN p_sort_by = 'alphabetical' THEN sp.full_name
      ELSE NULL
    END ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create get_suggested_connections RPC for personalized suggestions
CREATE OR REPLACE FUNCTION public.get_suggested_connections(
  p_user_id uuid,
  p_limit integer DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  full_name text,
  username text,
  avatar_url text,
  headline text,
  profession text,
  location text,
  country_of_origin text,
  focus_areas text[],
  industries text[],
  skills text[],
  match_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH current_user_profile AS (
    SELECT 
      p.focus_areas as user_focus,
      p.regional_expertise as user_region,
      p.industries as user_industries,
      p.skills as user_skills,
      p.country_of_origin as user_country,
      p.location_country as user_location
    FROM profiles p
    WHERE p.id = p_user_id
  )
  SELECT 
    p.id,
    p.full_name,
    p.username,
    p.avatar_url,
    p.headline,
    p.profession,
    p.location,
    p.country_of_origin,
    p.focus_areas,
    p.industries,
    p.skills,
    (
      -- Shared focus areas (30 points max - higher priority for suggestions)
      CASE 
        WHEN cardinality(p.focus_areas & (SELECT user_focus FROM current_user_profile)) >= 3 THEN 30
        WHEN cardinality(p.focus_areas & (SELECT user_focus FROM current_user_profile)) = 2 THEN 20
        WHEN cardinality(p.focus_areas & (SELECT user_focus FROM current_user_profile)) = 1 THEN 10
        ELSE 0
      END +
      
      -- Shared regional expertise (20 points max)
      CASE 
        WHEN cardinality(p.regional_expertise & (SELECT user_region FROM current_user_profile)) >= 2 THEN 20
        WHEN cardinality(p.regional_expertise & (SELECT user_region FROM current_user_profile)) = 1 THEN 10
        ELSE 0
      END +
      
      -- Shared industries (20 points max)
      CASE 
        WHEN cardinality(p.industries & (SELECT user_industries FROM current_user_profile)) >= 2 THEN 20
        WHEN cardinality(p.industries & (SELECT user_industries FROM current_user_profile)) = 1 THEN 10
        ELSE 0
      END +
      
      -- Shared skills (15 points max)
      CASE 
        WHEN cardinality(p.skills & (SELECT user_skills FROM current_user_profile)) >= 3 THEN 15
        WHEN cardinality(p.skills & (SELECT user_skills FROM current_user_profile)) >= 2 THEN 10
        WHEN cardinality(p.skills & (SELECT user_skills FROM current_user_profile)) = 1 THEN 5
        ELSE 0
      END +
      
      -- Same country of origin (15 points)
      CASE 
        WHEN p.country_of_origin = (SELECT user_country FROM current_user_profile) THEN 15
        ELSE 0
      END
    )::int AS match_score
  FROM profiles p
  INNER JOIN auth.users au ON au.id = p.id
  WHERE p.id != p_user_id
    AND p.is_public = true
    AND COALESCE(p.profile_completion_percentage, 0) >= 40
    -- Exclude existing connections
    AND NOT EXISTS (
      SELECT 1 FROM connections c
      WHERE ((c.requester_id = p_user_id AND c.recipient_id = p.id)
         OR (c.recipient_id = p_user_id AND c.requester_id = p.id))
        AND c.status = 'accepted'
    )
    -- Exclude pending requests (both directions)
    AND NOT EXISTS (
      SELECT 1 FROM connections c
      WHERE ((c.requester_id = p_user_id AND c.recipient_id = p.id)
         OR (c.recipient_id = p_user_id AND c.requester_id = p.id))
        AND c.status = 'pending'
    )
    -- Exclude blocked users
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users bu
      WHERE (bu.blocker_id = p_user_id AND bu.blocked_id = p.id)
         OR (bu.blocker_id = p.id AND bu.blocked_id = p_user_id)
    )
  ORDER BY match_score DESC, p.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Create rate_limit_checks table for connection request rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limit_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_user_action ON public.rate_limit_checks(user_id, action_type, created_at);

-- Enable RLS on rate_limit_checks
ALTER TABLE public.rate_limit_checks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own rate limit checks
CREATE POLICY "Users can view own rate limits"
  ON public.rate_limit_checks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.rate_limit_checks IS 'Tracks rate-limited actions like connection requests';