-- Fix function_search_path_mutable warnings by setting search_path = public on all affected functions

-- 5. posts_generate_slug_trigger (returns trigger) - must handle CASCADE
DROP TRIGGER IF EXISTS posts_auto_slug ON public.posts;
DROP FUNCTION IF EXISTS public.posts_generate_slug_trigger();
CREATE FUNCTION public.posts_generate_slug_trigger()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER posts_auto_slug
  BEFORE INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.posts_generate_slug_trigger();

-- 6. get_random_featured_insight (returns TABLE)
DROP FUNCTION IF EXISTS public.get_random_featured_insight();
CREATE FUNCTION public.get_random_featured_insight()
RETURNS TABLE(id uuid, title text, description text, query_prompt text, category text, region text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.title, i.description, i.query_prompt, i.category, i.region
  FROM dia_insights i
  WHERE i.is_active = true AND i.is_featured = true
  ORDER BY random()
  LIMIT 1;
END;
$$;

-- 7. increment_insight_click (returns void)
DROP FUNCTION IF EXISTS public.increment_insight_click(uuid);
CREATE FUNCTION public.increment_insight_click(insight_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE dia_insights
  SET click_count = COALESCE(click_count, 0) + 1,
      updated_at = now()
  WHERE id = insight_id;
END;
$$;

-- 8. get_suggested_connections (returns TABLE with full profile data)
DROP FUNCTION IF EXISTS public.get_suggested_connections(uuid, integer);
CREATE FUNCTION public.get_suggested_connections(p_user_id uuid, p_limit integer DEFAULT 10)
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
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
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
    50::integer as match_score
  FROM profiles p
  WHERE p.id != p_user_id
  AND p.id NOT IN (
    SELECT c.recipient_id FROM connections c WHERE c.requester_id = p_user_id
    UNION
    SELECT c.requester_id FROM connections c WHERE c.recipient_id = p_user_id
  )
  ORDER BY random()
  LIMIT p_limit;
END;
$$;