-- Align RPCs with frontend expectations and prevent execution errors
-- 1) Recreate dashboard counts to return JSON with expected keys
DROP FUNCTION IF EXISTS public.rpc_dashboard_counts();

CREATE OR REPLACE FUNCTION public.rpc_dashboard_counts()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_active_spaces int := 0;
  v_pending_joins int := 0;
  v_tasks_due_7d int := 0;
  v_saved_opportunities int := 0;
  v_unread_notifications int := 0;
BEGIN
  -- Active spaces: approved memberships for current user
  BEGIN
    SELECT count(*) INTO v_active_spaces
    FROM public.collaboration_memberships
    WHERE user_id = auth.uid() AND status = 'approved';
  EXCEPTION WHEN undefined_table THEN
    v_active_spaces := 0;
  END;

  -- Pending joins: pending memberships for current user
  BEGIN
    SELECT count(*) INTO v_pending_joins
    FROM public.collaboration_memberships
    WHERE user_id = auth.uid() AND status = 'pending';
  EXCEPTION WHEN undefined_table THEN
    v_pending_joins := 0;
  END;

  -- Tasks due in next 7 days for current user
  BEGIN
    SELECT count(*) INTO v_tasks_due_7d
    FROM public.tasks
    WHERE (assignee_id = auth.uid() OR assigned_to = auth.uid())
      AND (status IS NULL OR status NOT IN ('done','completed'))
      AND due_date <= now() + interval '7 days';
  EXCEPTION WHEN undefined_table THEN
    v_tasks_due_7d := 0;
  END;

  -- Saved opportunities for current user (if table exists)
  BEGIN
    SELECT count(*) INTO v_saved_opportunities
    FROM public.saved_opportunities
    WHERE user_id = auth.uid();
  EXCEPTION WHEN undefined_table THEN
    v_saved_opportunities := 0;
  END;

  -- Unread notifications for current user
  BEGIN
    SELECT count(*) INTO v_unread_notifications
    FROM public.notifications
    WHERE user_id = auth.uid() AND is_read = false;
  EXCEPTION WHEN undefined_table THEN
    v_unread_notifications := 0;
  END;

  RETURN json_build_object(
    'active_spaces', COALESCE(v_active_spaces, 0),
    'pending_joins', COALESCE(v_pending_joins, 0),
    'tasks_due_7d', COALESCE(v_tasks_due_7d, 0),
    'saved_opportunities', COALESCE(v_saved_opportunities, 0),
    'unread_notifications', COALESCE(v_unread_notifications, 0)
  );
END;
$$;

-- 2) People recommendations RPC used by frontend: rpc_adin_recommend_people()
DROP FUNCTION IF EXISTS public.rpc_adin_recommend_people();
CREATE OR REPLACE FUNCTION public.rpc_adin_recommend_people()
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
AS $$
BEGIN
  RETURN QUERY
  SELECT matched_user_id, match_score, match_reason, shared_regions, shared_sectors
  FROM public.find_adin_matches(auth.uid())
  ORDER BY match_score DESC
  LIMIT 5;
END;
$$;

-- 3) Opportunities recommendations RPC used by frontend: rpc_adin_recommend_opportunities()
DROP FUNCTION IF EXISTS public.rpc_adin_recommend_opportunities();
CREATE OR REPLACE FUNCTION public.rpc_adin_recommend_opportunities()
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
AS $$
BEGIN
  RETURN QUERY
  SELECT signal_id, signal_title, signal_type, match_score, signal_created_at
  FROM public.find_adin_matches(auth.uid(), 60)
  ORDER BY match_score DESC, signal_created_at DESC
  LIMIT 20;
END;
$$;

-- 4) Spaces recommendations RPC placeholder to avoid runtime errors
-- Returns an empty set if no specific logic yet, with a stable signature
DROP FUNCTION IF EXISTS public.rpc_adin_recommend_spaces();
CREATE OR REPLACE FUNCTION public.rpc_adin_recommend_spaces()
RETURNS TABLE(
  space_id uuid,
  space_name text,
  match_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If a spaces table exists, you can later replace this with real logic
  RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::integer WHERE false;
END;
$$;

-- Ensure execute privileges remain in place
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;