
-- Drop the OLD discover_members overload (without p_ethnic_heritage)
-- to resolve PostgREST PGRST203 ambiguity error.
-- The newer version WITH p_ethnic_heritage (defaulting to NULL) covers all use cases.
DROP FUNCTION IF EXISTS public.discover_members(
  p_current_user_id uuid,
  p_focus_areas text[],
  p_regional_expertise text[],
  p_industries text[],
  p_country_of_origin text,
  p_location_country text,
  p_skills text[],
  p_search_query text,
  p_sort_by text,
  p_limit integer,
  p_offset integer
);
