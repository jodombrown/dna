-- Drop and recreate discover_members with 40% profile gate enforcement
-- First drop the existing function
DROP FUNCTION IF EXISTS public.discover_members(uuid,text[],text[],text[],text,text,text[],text,text,integer,integer);

-- Recreate with profile gate enforcement
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
          WHEN p_country_of_origin IS NULL THEN
            CASE WHEN p.country_of_origin = (SELECT user_country FROM current_user_profile) THEN 20 ELSE 0 END
          WHEN p.country_of_origin = p_country_of_origin THEN 20
          ELSE 0
        END +
        
        -- Same current location country (20 points)
        CASE 
          WHEN p_location_country IS NULL THEN
            CASE WHEN p.location_country = (SELECT user_location FROM current_user_profile) THEN 20 ELSE 0 END
          WHEN p.location_country = p_location_country THEN 20
          ELSE 0
        END
      )::integer AS match_score
    FROM profiles p
    WHERE 
      -- Exclude self
      p.id != p_current_user_id
      -- CRITICAL PROFILE GATE: Must have at least 40% completion to appear in discovery
      AND COALESCE(p.profile_completion_percentage, 0) >= 40
      -- Exclude blocked users (both ways)
      AND NOT EXISTS (
        SELECT 1 FROM blocked_users b
        WHERE (b.blocker_id = p_current_user_id AND b.blocked_id = p.id)
           OR (b.blocker_id = p.id AND b.blocked_id = p_current_user_id)
      )
      -- Exclude users whose auth account was deleted
      AND EXISTS (
        SELECT 1 FROM auth.users u WHERE u.id = p.id
      )
      -- Filter by focus areas
      AND (p_focus_areas IS NULL OR p.focus_areas && p_focus_areas)
      -- Filter by regional expertise
      AND (p_regional_expertise IS NULL OR p.regional_expertise && p_regional_expertise)
      -- Filter by industries
      AND (p_industries IS NULL OR p.industries && p_industries)
      -- Filter by country of origin
      AND (p_country_of_origin IS NULL OR p.country_of_origin = p_country_of_origin)
      -- Filter by location country
      AND (p_location_country IS NULL OR p.location_country = p_location_country)
      -- Filter by skills
      AND (p_skills IS NULL OR p.skills && p_skills)
      -- Search query
      AND (
        p_search_query IS NULL 
        OR p.full_name ILIKE '%' || p_search_query || '%'
        OR p.username ILIKE '%' || p_search_query || '%'
        OR p.headline ILIKE '%' || p_search_query || '%'
        OR p.bio ILIKE '%' || p_search_query || '%'
        OR p.profession ILIKE '%' || p_search_query || '%'
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
      WHEN p_sort_by = 'recent' THEN EXTRACT(EPOCH FROM sp.created_at)::integer
      ELSE sp.match_score
    END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;