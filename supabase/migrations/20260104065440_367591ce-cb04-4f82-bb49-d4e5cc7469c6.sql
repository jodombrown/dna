-- Fix Security Definer View errors by recreating views with SECURITY INVOKER (default)

-- 1. adin_daily_stats
DROP VIEW IF EXISTS public.adin_daily_stats;
CREATE VIEW public.adin_daily_stats
WITH (security_invoker = true)
AS
SELECT 
  date(created_at) AS date,
  count(*) AS total_queries,
  count(*) FILTER (WHERE cache_hit = true) AS cache_hits,
  count(*) FILTER (WHERE cache_hit = false) AS cache_misses,
  round((100.0 * count(*) FILTER (WHERE cache_hit = true)::numeric) / NULLIF(count(*), 0)::numeric, 2) AS cache_hit_rate,
  round(avg(response_time_ms), 0) AS avg_response_time_ms,
  count(DISTINCT user_id) AS unique_users
FROM dia_query_log
GROUP BY date(created_at)
ORDER BY date(created_at) DESC;

-- 2. adin_cost_tracking
DROP VIEW IF EXISTS public.adin_cost_tracking;
CREATE VIEW public.adin_cost_tracking
WITH (security_invoker = true)
AS
SELECT 
  date(created_at) AS date,
  count(*) AS queries,
  sum(tokens_used) AS total_tokens,
  sum(estimated_cost) AS total_cost,
  round(avg(estimated_cost), 6) AS avg_cost_per_query
FROM dia_queries
WHERE created_at > (now() - '30 days'::interval)
GROUP BY date(created_at)
ORDER BY date(created_at) DESC;

-- 3. adin_popular_queries
DROP VIEW IF EXISTS public.adin_popular_queries;
CREATE VIEW public.adin_popular_queries
WITH (security_invoker = true)
AS
SELECT 
  query_text,
  count(*) AS query_count,
  count(DISTINCT user_id) AS unique_users,
  max(created_at) AS last_queried
FROM dia_query_log
WHERE created_at > (now() - '30 days'::interval)
GROUP BY query_text
HAVING count(*) > 1
ORDER BY count(*) DESC
LIMIT 50;