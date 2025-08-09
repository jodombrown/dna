-- Migration: RPCs for dashboard counts and ADIN recommendations + drop duplicate indexes

-- 1) Drop duplicate indexes flagged by linter (safe if they don't exist)
DROP INDEX IF EXISTS public.idx_notifications_user_read;
DROP INDEX IF EXISTS public.idx_contrib_user_created_at;

-- 2) Dashboard counts RPC
CREATE OR REPLACE FUNCTION public.rpc_dashboard_counts()
RETURNS TABLE(
  total_users integer,
  total_connections integer,
  total_posts integer,
  total_events integer,
  active_users_week integer,
  engagement_rate numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    public.get_total_users() as total_users,
    public.get_total_connections() as total_connections,
    public.get_total_posts() as total_posts,
    public.get_total_events() as total_events,
    public.get_active_users_this_week() as active_users_week,
    public.get_engagement_rate() as engagement_rate;
$function$;

-- 3) ADIN People Recommendations RPC (wraps existing find_adin_matches(target_user_id uuid))
CREATE OR REPLACE FUNCTION public.rpc_adin_recommendations_people(
  p_user_id uuid,
  p_limit integer DEFAULT 5
)
RETURNS TABLE(
  matched_user_id uuid,
  match_score numeric,
  match_reason text,
  shared_regions text[],
  shared_sectors text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT matched_user_id, match_score, match_reason, shared_regions, shared_sectors
  FROM public.find_adin_matches(p_user_id)
  ORDER BY match_score DESC
  LIMIT GREATEST(COALESCE(p_limit, 5), 1);
END;
$function$;

-- 4) ADIN Opportunity Recommendations RPC (wraps existing find_adin_matches(user_id, match_threshold))
CREATE OR REPLACE FUNCTION public.rpc_adin_recommendations_opportunities(
  p_user_id uuid,
  p_threshold integer DEFAULT 60,
  p_limit integer DEFAULT 20
)
RETURNS TABLE(
  signal_id uuid,
  signal_title text,
  signal_type text,
  match_score integer,
  signal_created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT signal_id, signal_title, signal_type, match_score, signal_created_at
  FROM public.find_adin_matches(p_user_id, p_threshold)
  ORDER BY match_score DESC, signal_created_at DESC
  LIMIT GREATEST(COALESCE(p_limit, 20), 1);
END;
$function$;