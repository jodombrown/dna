-- Drop all existing versions of discover_members to avoid conflicts
DROP FUNCTION IF EXISTS discover_members(uuid, text[], text[], text[], text, text, text[], text, text, int, int);
DROP FUNCTION IF EXISTS discover_members(uuid, text[], text[], text[], text, text, text, text, int, int);

-- Recreate with correct column names and no minimum score filter when filtering
CREATE OR REPLACE FUNCTION discover_members(
  p_current_user_id uuid,
  p_focus_areas text[] DEFAULT NULL,
  p_regional_expertise text[] DEFAULT NULL,
  p_industries text[] DEFAULT NULL,
  p_country_of_origin text DEFAULT NULL,
  p_location_country text DEFAULT NULL,
  p_skills text[] DEFAULT NULL,
  p_search_query text DEFAULT NULL,
  p_sort_by text DEFAULT 'match',
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  full_name text,
  username text,
  avatar_url text,
  banner_url text,
  banner_type text,
  banner_gradient text,
  banner_overlay text,
  headline text,
  profession text,
  location text,
  country_of_origin text,
  focus_areas text[],
  regional_expertise text[],
  industries text[],
  profile_completion_percentage int,
  match_score int
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_filters boolean;
BEGIN
  -- Check if any filters are applied
  has_filters := (
    p_focus_areas IS NOT NULL OR
    p_regional_expertise IS NOT NULL OR
    p_industries IS NOT NULL OR
    p_country_of_origin IS NOT NULL OR
    p_location_country IS NOT NULL OR
    p_skills IS NOT NULL OR
    p_search_query IS NOT NULL
  );

  RETURN QUERY
  WITH current_user_profile AS (
    SELECT 
      p.focus_areas as user_focus,
      p.regional_expertise as user_region,
      p.industries as user_industries,
      p.country_of_origin as user_country,
      p.current_country_name as user_location
    FROM profiles p
    WHERE p.id = p_current_user_id
  ),
  scored_profiles AS (
    SELECT
      p.id,
      p.full_name,
      p.username,
      p.avatar_url,
      p.banner_url,
      p.banner_type,
      p.banner_gradient,
      p.banner_overlay,
      p.headline,
      p.profession,
      p.location,
      p.country_of_origin,
      p.focus_areas,
      p.regional_expertise,
      p.industries,
      COALESCE(p.profile_completion_percentage, 0) as profile_completion_percentage,
      p.created_at,
      (
        -- Shared focus areas (20 points max)
        COALESCE(
          CASE 
            WHEN p.focus_areas IS NULL OR (SELECT user_focus FROM current_user_profile) IS NULL THEN 0
            WHEN cardinality(p.focus_areas) = 0 OR cardinality((SELECT user_focus FROM current_user_profile)) = 0 THEN 0
            WHEN array_length(ARRAY(SELECT unnest(p.focus_areas) INTERSECT SELECT unnest((SELECT user_focus FROM current_user_profile))), 1) >= 3 THEN 20
            WHEN array_length(ARRAY(SELECT unnest(p.focus_areas) INTERSECT SELECT unnest((SELECT user_focus FROM current_user_profile))), 1) = 2 THEN 14
            WHEN array_length(ARRAY(SELECT unnest(p.focus_areas) INTERSECT SELECT unnest((SELECT user_focus FROM current_user_profile))), 1) = 1 THEN 7
            ELSE 0
          END, 0
        ) +
        
        -- Shared regional expertise (15 points max)
        COALESCE(
          CASE 
            WHEN p.regional_expertise IS NULL OR (SELECT user_region FROM current_user_profile) IS NULL THEN 0
            WHEN cardinality(p.regional_expertise) = 0 OR cardinality((SELECT user_region FROM current_user_profile)) = 0 THEN 0
            WHEN array_length(ARRAY(SELECT unnest(p.regional_expertise) INTERSECT SELECT unnest((SELECT user_region FROM current_user_profile))), 1) >= 2 THEN 15
            WHEN array_length(ARRAY(SELECT unnest(p.regional_expertise) INTERSECT SELECT unnest((SELECT user_region FROM current_user_profile))), 1) = 1 THEN 8
            ELSE 0
          END, 0
        ) +
        
        -- Shared industries (15 points max)
        COALESCE(
          CASE 
            WHEN p.industries IS NULL OR (SELECT user_industries FROM current_user_profile) IS NULL THEN 0
            WHEN cardinality(p.industries) = 0 OR cardinality((SELECT user_industries FROM current_user_profile)) = 0 THEN 0
            WHEN array_length(ARRAY(SELECT unnest(p.industries) INTERSECT SELECT unnest((SELECT user_industries FROM current_user_profile))), 1) >= 2 THEN 15
            WHEN array_length(ARRAY(SELECT unnest(p.industries) INTERSECT SELECT unnest((SELECT user_industries FROM current_user_profile))), 1) = 1 THEN 8
            ELSE 0
          END, 0
        ) +
        
        -- Same country of origin (20 points)
        CASE 
          WHEN p.country_of_origin IS NOT NULL 
               AND p.country_of_origin = (SELECT user_country FROM current_user_profile) THEN 20
          ELSE 0
        END +
        
        -- Same current location (10 points)
        CASE 
          WHEN p.current_country_name IS NOT NULL 
               AND p.current_country_name = (SELECT user_location FROM current_user_profile) THEN 10
          ELSE 0
        END +
        
        -- Profile completeness bonus (10 points)
        CASE 
          WHEN COALESCE(p.profile_completion_percentage, 0) >= 80 THEN 10
          WHEN COALESCE(p.profile_completion_percentage, 0) >= 50 THEN 5
          ELSE 0
        END +
        
        -- Open to engage (10 points total)
        CASE WHEN p.open_to_mentor = true THEN 5 ELSE 0 END +
        CASE WHEN p.open_to_invest = true THEN 5 ELSE 0 END
      )::int AS match_score
      
    FROM profiles p
    WHERE
      p.id != p_current_user_id
      AND COALESCE(p.is_public, true) = true
      -- Country of origin filter with ILIKE for flexibility
      AND (p_country_of_origin IS NULL OR p.country_of_origin ILIKE p_country_of_origin)
      -- Current country filter
      AND (p_location_country IS NULL OR p.current_country_name ILIKE p_location_country)
      -- Array filters with overlap
      AND (p_focus_areas IS NULL OR p.focus_areas && p_focus_areas)
      AND (p_regional_expertise IS NULL OR p.regional_expertise && p_regional_expertise)
      AND (p_industries IS NULL OR p.industries && p_industries)
      AND (p_skills IS NULL OR p.skills && p_skills)
      -- Text search
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
    sp.profile_completion_percentage,
    sp.match_score
  FROM scored_profiles sp
  -- Only apply minimum score filter when NO filters are applied (discovery mode)
  -- When filters are applied, show all matching results regardless of score
  WHERE (has_filters = true OR sp.match_score >= 0)
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
    END ASC,
    sp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;