-- Fix remaining 4 functions with mutable search_path

-- 1. cleanup_expired_adin_cache (returns integer)
DROP FUNCTION IF EXISTS public.cleanup_expired_adin_cache();
CREATE FUNCTION public.cleanup_expired_adin_cache()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM dia_queries WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 2. generate_slug (returns text) - also used by trigger
DROP FUNCTION IF EXISTS public.generate_slug(text);
CREATE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$;

-- 3. get_adin_user_usage (returns TABLE with 5 columns)
DROP FUNCTION IF EXISTS public.get_adin_user_usage(uuid);
CREATE FUNCTION public.get_adin_user_usage(p_user_id uuid)
RETURNS TABLE(query_count integer, query_limit integer, queries_remaining integer, period_start date, resets_at date)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.query_count::integer,
    u.query_limit::integer,
    (u.query_limit - u.query_count)::integer as queries_remaining,
    u.period_start::date,
    (u.period_start + interval '1 month')::date as resets_at
  FROM dia_user_usage u
  WHERE u.user_id = p_user_id
  AND u.period_start = date_trunc('month', now());
END;
$$;

-- 4. increment_adin_usage (returns boolean)
DROP FUNCTION IF EXISTS public.increment_adin_usage(uuid, integer, numeric);
CREATE FUNCTION public.increment_adin_usage(p_user_id uuid, p_tokens_used integer DEFAULT 0, p_estimated_cost numeric DEFAULT 0)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO dia_user_usage (user_id, period_start, query_count, total_tokens_used, total_estimated_cost, last_query_at)
  VALUES (p_user_id, date_trunc('month', now()), 1, p_tokens_used, p_estimated_cost, now())
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET
    query_count = dia_user_usage.query_count + 1,
    total_tokens_used = dia_user_usage.total_tokens_used + p_tokens_used,
    total_estimated_cost = dia_user_usage.total_estimated_cost + p_estimated_cost,
    last_query_at = now(),
    updated_at = now();
  RETURN true;
END;
$$;