-- Address linter warnings: use (select auth.uid()) in RLS and remove duplicate policies

-- Notifications: drop duplicates and recreate optimized policies
DO $$
BEGIN
  EXECUTE 'ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY';
END $$;

-- Drop possibly existing variants to avoid duplicates
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- Recreate with (select auth.uid()) for initplan optimization
CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));


-- Verified contributors: ensure auth.uid wrapped in SELECT
DO $$
BEGIN
  EXECUTE 'ALTER TABLE public.verified_contributors ENABLE ROW LEVEL SECURITY';
END $$;

DROP POLICY IF EXISTS "Only admins can insert verified contributors" ON public.verified_contributors;
DROP POLICY IF EXISTS "Only admins can update verified contributors" ON public.verified_contributors;
DROP POLICY IF EXISTS "Only admins can delete verified contributors" ON public.verified_contributors;

CREATE POLICY "Only admins can insert verified contributors"
ON public.verified_contributors
FOR INSERT
TO authenticated
WITH CHECK (is_admin_user((select auth.uid())));

CREATE POLICY "Only admins can update verified contributors"
ON public.verified_contributors
FOR UPDATE
TO authenticated
USING (is_admin_user((select auth.uid())));

CREATE POLICY "Only admins can delete verified contributors"
ON public.verified_contributors
FOR DELETE
TO authenticated
USING (is_admin_user((select auth.uid())));
