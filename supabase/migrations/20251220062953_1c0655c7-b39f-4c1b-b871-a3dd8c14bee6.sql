-- Drop the broken function and recreate with correct column names
DROP FUNCTION IF EXISTS public.discover_members(uuid, text[], text[], text[], text, text, text, integer, integer, text, text);

-- Recreate discover_members with correct schema and simple fallback logic
CREATE OR REPLACE FUNCTION public.discover_members(
  p_user_id uuid DEFAULT NULL,
  p_focus_areas text[] DEFAULT NULL,
  p_regional_expertise text[] DEFAULT NULL,
  p_industries text[] DEFAULT NULL,
  p_country_of_origin text DEFAULT NULL,
  p_location_country text DEFAULT NULL,
  p_search_term text DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0,
  p_sort_by text DEFAULT 'relevance',
  p_sort_order text DEFAULT 'desc'
)
RETURNS TABLE (
  id uuid,
  full_name text,
  headline text,
  bio text,
  avatar_url text,
  location text,
  profession text,
  company text,
  country_of_origin text,
  current_country text,
  skills text[],
  interests text[],
  focus_areas text[],
  regional_expertise text[],
  industries text[],
  match_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_focus text[];
  v_user_regions text[];
  v_user_industries text[];
  v_user_skills text[];
  v_user_origin text;
  v_user_location text;
BEGIN
  -- Get current user's profile for matching (if logged in)
  IF p_user_id IS NOT NULL THEN
    SELECT 
      COALESCE(p.impact_areas, ARRAY[]::text[]),
      COALESCE(p.impact_regions, ARRAY[]::text[]),
      COALESCE(p.sectors, ARRAY[]::text[]),
      COALESCE(p.skills, ARRAY[]::text[]),
      COALESCE(p.country_of_origin, p.origin_country_name),
      COALESCE(p.current_country, p.current_country_name)
    INTO v_user_focus, v_user_regions, v_user_industries, v_user_skills, v_user_origin, v_user_location
    FROM profiles p
    WHERE p.id = p_user_id;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.headline,
    p.bio,
    COALESCE(p.avatar_url, p.profile_picture_url) as avatar_url,
    p.location,
    p.profession,
    p.company,
    COALESCE(p.country_of_origin, p.origin_country_name) as country_of_origin,
    COALESCE(p.current_country, p.current_country_name) as current_country,
    p.skills,
    p.interests,
    COALESCE(p.impact_areas, ARRAY[]::text[]) as focus_areas,
    COALESCE(p.impact_regions, ARRAY[]::text[]) as regional_expertise,
    COALESCE(p.sectors, ARRAY[]::text[]) as industries,
    -- Calculate match score
    CASE 
      WHEN p_user_id IS NULL THEN 50
      WHEN p.id = p_user_id THEN 0
      ELSE LEAST(100, GREATEST(10,
        -- Focus areas overlap (max 25 pts)
        COALESCE((
          SELECT COUNT(*) * 5 
          FROM unnest(COALESCE(p.impact_areas, ARRAY[]::text[])) ua
          WHERE ua = ANY(v_user_focus)
        ), 0)::int +
        -- Regional expertise overlap (max 20 pts)
        COALESCE((
          SELECT COUNT(*) * 5 
          FROM unnest(COALESCE(p.impact_regions, ARRAY[]::text[])) ur
          WHERE ur = ANY(v_user_regions)
        ), 0)::int +
        -- Industries overlap (max 20 pts)
        COALESCE((
          SELECT COUNT(*) * 5 
          FROM unnest(COALESCE(p.sectors, ARRAY[]::text[])) ui
          WHERE ui = ANY(v_user_industries)
        ), 0)::int +
        -- Skills overlap (max 15 pts)
        COALESCE((
          SELECT COUNT(*) * 3 
          FROM unnest(COALESCE(p.skills, ARRAY[]::text[])) us
          WHERE us = ANY(v_user_skills)
        ), 0)::int +
        -- Same country of origin (15 pts)
        CASE WHEN v_user_origin IS NOT NULL 
             AND COALESCE(p.country_of_origin, p.origin_country_name) = v_user_origin 
             THEN 15 ELSE 0 END +
        -- Same current location (10 pts)
        CASE WHEN v_user_location IS NOT NULL 
             AND COALESCE(p.current_country, p.current_country_name) = v_user_location 
             THEN 10 ELSE 0 END +
        -- Base profile exists score (10 pts)
        10
      ))
    END::integer as match_score
  FROM profiles p
  WHERE
    -- Exclude current user
    (p_user_id IS NULL OR p.id != p_user_id)
    -- Search term filter
    AND (
      p_search_term IS NULL 
      OR p_search_term = ''
      OR p.full_name ILIKE '%' || p_search_term || '%'
      OR p.headline ILIKE '%' || p_search_term || '%'
      OR p.bio ILIKE '%' || p_search_term || '%'
      OR p.profession ILIKE '%' || p_search_term || '%'
      OR p.company ILIKE '%' || p_search_term || '%'
    )
    -- Country of origin filter
    AND (
      p_country_of_origin IS NULL 
      OR p_country_of_origin = ''
      OR COALESCE(p.country_of_origin, p.origin_country_name) ILIKE '%' || p_country_of_origin || '%'
    )
    -- Location country filter
    AND (
      p_location_country IS NULL 
      OR p_location_country = ''
      OR COALESCE(p.current_country, p.current_country_name) ILIKE '%' || p_location_country || '%'
    )
    -- Focus areas filter
    AND (
      p_focus_areas IS NULL 
      OR array_length(p_focus_areas, 1) IS NULL
      OR EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.impact_areas, ARRAY[]::text[])) fa 
        WHERE fa = ANY(p_focus_areas)
      )
    )
    -- Regional expertise filter
    AND (
      p_regional_expertise IS NULL 
      OR array_length(p_regional_expertise, 1) IS NULL
      OR EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.impact_regions, ARRAY[]::text[])) re 
        WHERE re = ANY(p_regional_expertise)
      )
    )
    -- Industries filter
    AND (
      p_industries IS NULL 
      OR array_length(p_industries, 1) IS NULL
      OR EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.sectors, ARRAY[]::text[])) ind 
        WHERE ind = ANY(p_industries)
      )
    )
  ORDER BY
    CASE WHEN p_sort_by = 'relevance' AND p_sort_order = 'desc' THEN 
      CASE 
        WHEN p_user_id IS NULL THEN 50
        ELSE LEAST(100, GREATEST(10,
          COALESCE((SELECT COUNT(*) * 5 FROM unnest(COALESCE(p.impact_areas, ARRAY[]::text[])) ua WHERE ua = ANY(v_user_focus)), 0)::int +
          COALESCE((SELECT COUNT(*) * 5 FROM unnest(COALESCE(p.impact_regions, ARRAY[]::text[])) ur WHERE ur = ANY(v_user_regions)), 0)::int +
          COALESCE((SELECT COUNT(*) * 5 FROM unnest(COALESCE(p.sectors, ARRAY[]::text[])) ui WHERE ui = ANY(v_user_industries)), 0)::int +
          COALESCE((SELECT COUNT(*) * 3 FROM unnest(COALESCE(p.skills, ARRAY[]::text[])) us WHERE us = ANY(v_user_skills)), 0)::int +
          CASE WHEN v_user_origin IS NOT NULL AND COALESCE(p.country_of_origin, p.origin_country_name) = v_user_origin THEN 15 ELSE 0 END +
          CASE WHEN v_user_location IS NOT NULL AND COALESCE(p.current_country, p.current_country_name) = v_user_location THEN 10 ELSE 0 END +
          10
        ))
      END
    END DESC NULLS LAST,
    p.full_name ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;