-- Consolidate RLS policies on public.notifications to remove duplicates and scope to authenticated
-- Ensure RLS is enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop redundant/old policies if present
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "update read own notifications" ON public.notifications;

-- Create single SELECT policy scoped to authenticated
CREATE POLICY "Users can view their own notifications"
ON public.notifications
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR public.is_admin_user(auth.uid())
);

-- Create single UPDATE policy scoped to authenticated
CREATE POLICY "Users can update their own notifications"
ON public.notifications
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR public.is_admin_user(auth.uid())
)
WITH CHECK (
  user_id = auth.uid() OR public.is_admin_user(auth.uid())
);
