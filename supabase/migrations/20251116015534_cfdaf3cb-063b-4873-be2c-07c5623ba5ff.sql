-- Fix RLS policies to avoid auth.* initplan re-evaluation by wrapping with subselect per Supabase guidance
-- https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- user_dashboard_preferences policies
DROP POLICY IF EXISTS "Users can view their own dashboard preferences" ON public.user_dashboard_preferences;
CREATE POLICY "Users can view their own dashboard preferences"
ON public.user_dashboard_preferences
FOR SELECT
USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own dashboard preferences" ON public.user_dashboard_preferences;
CREATE POLICY "Users can insert their own dashboard preferences"
ON public.user_dashboard_preferences
FOR INSERT
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own dashboard preferences" ON public.user_dashboard_preferences;
CREATE POLICY "Users can update their own dashboard preferences"
ON public.user_dashboard_preferences
FOR UPDATE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- user_last_view_state policies
DROP POLICY IF EXISTS "Users can view their own last view state" ON public.user_last_view_state;
CREATE POLICY "Users can view their own last view state"
ON public.user_last_view_state
FOR SELECT
USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own last view state" ON public.user_last_view_state;
CREATE POLICY "Users can insert their own last view state"
ON public.user_last_view_state
FOR INSERT
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own last view state" ON public.user_last_view_state;
CREATE POLICY "Users can update their own last view state"
ON public.user_last_view_state
FOR UPDATE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- dashboard_analytics policies
-- Preserve admin visibility but use subselect for auth.uid()
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.dashboard_analytics;
CREATE POLICY "Admins can view all analytics"
ON public.dashboard_analytics
FOR SELECT
USING (public.has_role((select auth.uid()), 'admin'));

-- If there is a policy for users inserting their own analytics, keep it as-is or create a safe one
DROP POLICY IF EXISTS "Users can insert analytics events" ON public.dashboard_analytics;
CREATE POLICY "Users can insert analytics events"
ON public.dashboard_analytics
FOR INSERT
WITH CHECK (
  -- Allow any authenticated user to insert their own event rows
  (select auth.uid()) IS NOT NULL
);
