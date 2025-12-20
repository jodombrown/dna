-- Drop and recreate with correct types
DROP FUNCTION IF EXISTS discover_members(uuid, text[], text[], text[], text, text, text[], text, text, int, int);

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
  banner_overlay boolean,
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
      pr.current_country_name as user_location
    FROM profiles pr
    WHERE pr.id = p_current_user_id
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
        -- Same country of origin (25 points)
        CASE 
          WHEN pr.country_of_origin IS NOT NULL 
               AND pr.country_of_origin = (SELECT user_country FROM current_user_profile) THEN 25
          ELSE 0
        END +
        
        -- Same current location (15 points)
        CASE 
          WHEN pr.current_country_name IS NOT NULL 
               AND pr.current_country_name = (SELECT user_location FROM current_user_profile) THEN 15
          ELSE 0
        END +
        
        -- Profile completeness bonus (15 points max)
        CASE 
          WHEN COALESCE(pr.profile_completion_percentage, 0) >= 80 THEN 15
          WHEN COALESCE(pr.profile_completion_percentage, 0) >= 50 THEN 10
          WHEN COALESCE(pr.profile_completion_percentage, 0) >= 30 THEN 5
          ELSE 0
        END +
        
        -- Has focus areas (10 points)
        CASE WHEN pr.focus_areas IS NOT NULL AND array_length(pr.focus_areas, 1) > 0 THEN 10 ELSE 0 END +
        
        -- Has regional expertise (10 points)
        CASE WHEN pr.regional_expertise IS NOT NULL AND array_length(pr.regional_expertise, 1) > 0 THEN 10 ELSE 0 END +
        
        -- Has industries (10 points)
        CASE WHEN pr.industries IS NOT NULL AND array_length(pr.industries, 1) > 0 THEN 10 ELSE 0 END +
        
        -- Mentorship offering (5 points)
        CASE WHEN pr.mentorship_offering = true THEN 5 ELSE 0 END +
        
        -- Open to opportunities (5 points)  
        CASE WHEN pr.open_to_opportunities = true THEN 5 ELSE 0 END +
        
        -- Has headline (5 points)
        CASE WHEN pr.headline IS NOT NULL AND LENGTH(pr.headline) > 10 THEN 5 ELSE 0 END
      )::int AS calc_match_score
      
    FROM profiles pr
    WHERE
      pr.id != p_current_user_id
      AND COALESCE(pr.is_public, true) = true
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