-- Fix previous migration error and consolidate RLS policies

-- Notifications table: ensure RLS and single, efficient policies
DO $$
BEGIN
  EXECUTE 'ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN
  RAISE EXCEPTION 'Table public.notifications does not exist. Please ensure the notifications table is created before applying policies.';
END $$;

-- Drop duplicate/old policies if present (by explicit names)
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'System can create notifications';
  IF FOUND THEN EXECUTE 'DROP POLICY "System can create notifications" ON public.notifications'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Users can insert their notifications';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can insert their notifications" ON public.notifications'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Users can view their notifications';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can view their notifications" ON public.notifications'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Users can view their own notifications';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can view their own notifications" ON public.notifications'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Users can update their notifications';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can update their notifications" ON public.notifications'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Users can update their own notifications';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can update their own notifications" ON public.notifications'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Users can delete their notifications';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can delete their notifications" ON public.notifications'; END IF;
END $$;

-- Create single optimized policies
DO $$
BEGIN
  -- Avoid duplicates if rerun
  EXECUTE 'DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications';
  EXECUTE 'DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications';
  EXECUTE 'DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications';
  EXECUTE 'DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications';
END $$;

CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (user_id = auth.uid());


-- Verified contributors table: consolidate policies
DO $$
BEGIN
  EXECUTE 'ALTER TABLE public.verified_contributors ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN
  RAISE EXCEPTION 'Table public.verified_contributors does not exist. Please ensure the table is created before applying policies.';
END $$;

-- Drop all existing policies on verified_contributors safely
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='verified_contributors' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.verified_contributors', r.policyname);
  END LOOP;
END $$;

-- Create consolidated policies
-- Public read (single policy for all roles)
CREATE POLICY "Verified contributors are viewable by everyone"
ON public.verified_contributors
FOR SELECT
TO public
USING (true);

-- Admin writes
CREATE POLICY "Only admins can insert verified contributors"
ON public.verified_contributors
FOR INSERT
TO authenticated
WITH CHECK (is_admin_user(auth.uid()));

CREATE POLICY "Only admins can update verified contributors"
ON public.verified_contributors
FOR UPDATE
TO authenticated
USING (is_admin_user(auth.uid()));

CREATE POLICY "Only admins can delete verified contributors"
ON public.verified_contributors
FOR DELETE
TO authenticated
USING (is_admin_user(auth.uid()));
