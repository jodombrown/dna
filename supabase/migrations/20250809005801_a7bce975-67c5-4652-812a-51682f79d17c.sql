-- Fix rpc_dashboard_counts and explicit grants for recommendation RPCs

-- 1) Recreate rpc_dashboard_counts with robust task due-date handling
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
  has_due_date boolean := false;
  has_due_at boolean := false;
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
    -- Detect due date column name if tasks table exists
    PERFORM 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'tasks';
    IF FOUND THEN
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='tasks' AND column_name='due_date'
      ) INTO has_due_date;
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='tasks' AND column_name='due_at'
      ) INTO has_due_at;

      IF has_due_date THEN
        SELECT count(*) INTO v_tasks_due_7d
        FROM public.tasks
        WHERE assignee_id = auth.uid()
          AND (status IS NULL OR status NOT IN ('done','completed'))
          AND due_date <= now() + interval '7 days';
      ELSIF has_due_at THEN
        SELECT count(*) INTO v_tasks_due_7d
        FROM public.tasks
        WHERE assignee_id = auth.uid()
          AND (status IS NULL OR status NOT IN ('done','completed'))
          AND due_at <= now() + interval '7 days';
      ELSE
        -- Fallback: count open tasks assigned to user ignoring due date
        SELECT count(*) INTO v_tasks_due_7d
        FROM public.tasks
        WHERE assignee_id = auth.uid()
          AND (status IS NULL OR status NOT IN ('done','completed'));
      END IF;
    ELSE
      v_tasks_due_7d := 0;
    END IF;
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

-- 2) Explicit grants for the recommendation RPCs
DO $$
BEGIN
  -- rpc_adin_recommend_people (no-arg)
  BEGIN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.rpc_adin_recommend_people() TO anon, authenticated';
  EXCEPTION WHEN undefined_function THEN
    -- ignore if not present
    NULL;
  END;

  -- rpc_adin_recommend_opportunities (no-arg)
  BEGIN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.rpc_adin_recommend_opportunities() TO anon, authenticated';
  EXCEPTION WHEN undefined_function THEN
    NULL;
  END;

  -- rpc_adin_recommend_spaces (no-arg)
  BEGIN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.rpc_adin_recommend_spaces() TO anon, authenticated';
  EXCEPTION WHEN undefined_function THEN
    NULL;
  END;
END$$;