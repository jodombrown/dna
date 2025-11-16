-- Consolidate duplicate INSERT policies on dashboard_analytics
-- Remove multiple permissive policies per linter warning

DROP POLICY IF EXISTS "System can insert analytics events" ON public.dashboard_analytics;
DROP POLICY IF EXISTS "Users can insert analytics events" ON public.dashboard_analytics;

-- Single unified INSERT policy for all authenticated users
CREATE POLICY "Authenticated users can insert analytics events"
ON public.dashboard_analytics
FOR INSERT
WITH CHECK (
  (select auth.uid()) IS NOT NULL
);
