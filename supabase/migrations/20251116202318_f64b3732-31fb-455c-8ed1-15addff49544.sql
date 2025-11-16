-- Fix discover_members RPC to stop referencing non-existent column and ensure robust filtering
-- Drop existing overloaded function if signature matches
DROP FUNCTION IF EXISTS public.discover_members(
  uuid,
  text[],
  text[],
  text[],
  text,
  text,
  text[],
  text,
  text,
  integer,
  integer
);

-- Recreate discover_members with correct logic
CREATE OR REPLACE FUNCTION public.discover_members(
  p_current_user_id uuid,
  p_focus_areas text[] DEFAULT NULL,
  p_regional_expertise text[] DEFAULT NULL,
  p_industries text[] DEFAULT NULL,
  p_country_of_origin text DEFAULT NULL,
  p_location_country text DEFAULT NULL,
  p_skills text[] DEFAULT NULL,
  p_search_query text DEFAULT NULL,
  p_sort_by text DEFAULT 'match',
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
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
LANGUAGE sql
SECURITY DEFINER
AS $$
WITH me AS (
  SELECT 
    COALESCE(focus_areas, ARRAY[]::text[]) AS focus_areas,
    COALESCE(regional_expertise, ARRAY[]::text[]) AS regional_expertise,
    COALESCE(industries, ARRAY[]::text[]) AS industries,
    COALESCE(skills, ARRAY[]::text[]) AS skills
  FROM public.profiles
  WHERE id = p_current_user_id
), base AS (
  SELECT 
    p.*,
    (
      COALESCE(
        cardinality(
          ARRAY(
            SELECT unnest(COALESCE(p.focus_areas, ARRAY[]::text[]))
            INTERSECT
            SELECT unnest((SELECT m.focus_areas FROM me m))
          )
        ), 0
      ) +
      COALESCE(
        cardinality(
          ARRAY(
            SELECT unnest(COALESCE(p.industries, ARRAY[]::text[]))
            INTERSECT
            SELECT unnest((SELECT m.industries FROM me m))
          )
        ), 0
      ) +
      COALESCE(
        cardinality(
          ARRAY(
            SELECT unnest(COALESCE(p.skills, ARRAY[]::text[]))
            INTERSECT
            SELECT unnest((SELECT m.skills FROM me m))
          )
        ), 0
      )
    ) AS computed_match
  FROM public.profiles p
  WHERE p.id <> p_current_user_id
    AND COALESCE(p.profile_completion_percentage, 0) >= 40
    AND COALESCE(p.is_public, true) = true
    -- Safety: exclude blocked relationships both ways
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_users b
      WHERE (b.blocker_id = p_current_user_id AND b.blocked_id = p.id)
         OR (b.blocker_id = p.id AND b.blocked_id = p_current_user_id)
    )
    -- Text search
    AND (
      p_search_query IS NULL
      OR p.full_name ILIKE '%' || p_search_query || '%'
      OR p.headline ILIKE '%' || p_search_query || '%'
      OR p.bio ILIKE '%' || p_search_query || '%'
    )
    -- Array filters (overlap)
    AND (p_focus_areas IS NULL OR COALESCE(p.focus_areas, ARRAY[]::text[]) && p_focus_areas)
    AND (p_regional_expertise IS NULL OR COALESCE(p.regional_expertise, ARRAY[]::text[]) && p_regional_expertise)
    AND (p_industries IS NULL OR COALESCE(p.industries, ARRAY[]::text[]) && p_industries)
    AND (p_skills IS NULL OR COALESCE(p.skills, ARRAY[]::text[]) && p_skills)
    -- Scalar filters
    AND (p_country_of_origin IS NULL OR p.country_of_origin ILIKE '%' || p_country_of_origin || '%')
    AND (p_location_country IS NULL OR COALESCE(p.current_country, '') ILIKE '%' || p_location_country || '%')
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
  COALESCE(p.computed_match, 0) AS match_score
FROM base p
ORDER BY 
  CASE WHEN p_sort_by = 'match' THEN p.computed_match END DESC NULLS LAST,
  CASE WHEN p_sort_by = 'recent' THEN COALESCE(p.updated_at, p.created_at) END DESC NULLS LAST,
  p.full_name ASC
LIMIT p_limit OFFSET p_offset;
$$;

-- Ensure authenticated users can call the function
GRANT EXECUTE ON FUNCTION public.discover_members(
  uuid, text[], text[], text[], text, text, text[], text, text, integer, integer
) TO authenticated;