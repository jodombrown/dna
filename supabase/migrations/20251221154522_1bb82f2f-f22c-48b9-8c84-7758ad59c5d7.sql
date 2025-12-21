-- Drop and recreate discover_members with ADIN-powered matching (80%+ threshold support)
CREATE OR REPLACE FUNCTION public.discover_members(
  p_current_user_id uuid,
  p_focus_areas text[] DEFAULT NULL,
  p_regional_expertise text[] DEFAULT NULL,
  p_industries text[] DEFAULT NULL,
  p_country_of_origin text DEFAULT NULL,
  p_location_country text DEFAULT NULL,
  p_search_query text DEFAULT NULL,
  p_sort_by text DEFAULT 'match',
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0,
  p_skills text[] DEFAULT NULL
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
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH current_user_profile AS (
    SELECT 
      pr.focus_areas as user_focus,
      pr.regional_expertise as user_region,
      pr.industries as user_industries,
      pr.country_of_origin as user_country,
      pr.current_country_name as user_location,
      pr.skills as user_skills
    FROM profiles pr
    WHERE pr.id = p_current_user_id
  ),
  blocked_users AS (
    SELECT blocked_id FROM blocked_users WHERE blocker_id = p_current_user_id
    UNION
    SELECT blocker_id FROM blocked_users WHERE blocked_id = p_current_user_id
  ),
  scored_profiles AS (
    SELECT
      pr.id,
      pr.full_name,
      pr.username,
      pr.avatar_url,
      pr.banner_url,
      pr.banner_type,
      pr.banner_gradient,
      pr.banner_overlay,
      pr.headline,
      pr.profession,
      pr.location,
      pr.country_of_origin,
      pr.focus_areas,
      pr.regional_expertise,
      pr.industries,
      COALESCE(pr.profile_completion_percentage, 0)::int as profile_comp,
      pr.created_at,
      (
        -- ADIN Intelligence: Focus area overlap (30 points max)
        CASE 
          WHEN pr.focus_areas IS NOT NULL 
               AND (SELECT user_focus FROM current_user_profile) IS NOT NULL
               AND pr.focus_areas && (SELECT user_focus FROM current_user_profile) 
          THEN LEAST(30, 10 * COALESCE(array_length(
            ARRAY(SELECT UNNEST(pr.focus_areas) INTERSECT SELECT UNNEST((SELECT user_focus FROM current_user_profile))),
            1
          ), 0))
          ELSE 0
        END +
        
        -- ADIN Intelligence: Regional expertise overlap (20 points max)
        CASE 
          WHEN pr.regional_expertise IS NOT NULL 
               AND (SELECT user_region FROM current_user_profile) IS NOT NULL
               AND pr.regional_expertise && (SELECT user_region FROM current_user_profile) 
          THEN LEAST(20, 10 * COALESCE(array_length(
            ARRAY(SELECT UNNEST(pr.regional_expertise) INTERSECT SELECT UNNEST((SELECT user_region FROM current_user_profile))),
            1
          ), 0))
          ELSE 0
        END +
        
        -- ADIN Intelligence: Industry overlap (20 points max)
        CASE 
          WHEN pr.industries IS NOT NULL 
               AND (SELECT user_industries FROM current_user_profile) IS NOT NULL
               AND pr.industries && (SELECT user_industries FROM current_user_profile) 
          THEN LEAST(20, 10 * COALESCE(array_length(
            ARRAY(SELECT UNNEST(pr.industries) INTERSECT SELECT UNNEST((SELECT user_industries FROM current_user_profile))),
            1
          ), 0))
          ELSE 0
        END +
        
        -- Same country of origin (15 points)
        CASE 
          WHEN pr.country_of_origin IS NOT NULL 
               AND pr.country_of_origin = (SELECT user_country FROM current_user_profile) THEN 15
          ELSE 0
        END +
        
        -- Same current location (10 points)
        CASE 
          WHEN pr.current_country_name IS NOT NULL 
               AND pr.current_country_name = (SELECT user_location FROM current_user_profile) THEN 10
          ELSE 0
        END +
        
        -- Profile completeness bonus (5 points max)
        CASE 
          WHEN COALESCE(pr.profile_completion_percentage, 0) >= 80 THEN 5
          WHEN COALESCE(pr.profile_completion_percentage, 0) >= 50 THEN 3
          ELSE 0
        END
      )::int AS calc_match_score
      
    FROM profiles pr
    WHERE
      pr.id != p_current_user_id
      AND pr.id NOT IN (SELECT blocked_id FROM blocked_users)
      AND COALESCE(pr.is_public, true) = true
      AND COALESCE(pr.profile_completion_percentage, 0) >= 40
      AND (p_country_of_origin IS NULL OR pr.country_of_origin ILIKE p_country_of_origin)
      AND (p_location_country IS NULL OR pr.current_country_name ILIKE p_location_country)
      AND (p_focus_areas IS NULL OR pr.focus_areas && p_focus_areas)
      AND (p_regional_expertise IS NULL OR pr.regional_expertise && p_regional_expertise)
      AND (p_industries IS NULL OR pr.industries && p_industries)
      AND (p_skills IS NULL OR pr.skills && p_skills)
      AND (
        p_search_query IS NULL OR
        pr.full_name ILIKE '%' || p_search_query || '%' OR
        pr.headline ILIKE '%' || p_search_query || '%' OR
        pr.username ILIKE '%' || p_search_query || '%' OR
        pr.bio ILIKE '%' || p_search_query || '%'
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
    sp.profile_comp as profile_completion_percentage,
    sp.calc_match_score as match_score
  FROM scored_profiles sp
  ORDER BY 
    CASE 
      WHEN p_sort_by = 'match' THEN sp.calc_match_score
      WHEN p_sort_by = 'completion' THEN sp.profile_comp
      ELSE 0
    END DESC,
    sp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;