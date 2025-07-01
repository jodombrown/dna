
-- Fix RLS performance issues by updating auth function calls to use subqueries
-- This prevents re-evaluation of auth.uid() for each row

-- Fix community_flags table RLS policy
DROP POLICY IF EXISTS "Admins can manage community flags" ON public.community_flags;
CREATE POLICY "Admins can manage community flags" ON public.community_flags
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid()) AND is_active = true
  )
);

-- Fix communities table RLS policy
DROP POLICY IF EXISTS "Communities viewable by everyone or admins" ON public.communities;
CREATE POLICY "Communities viewable by everyone or admins" ON public.communities
FOR SELECT USING (
  moderation_status = 'approved' OR 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid()) AND is_active = true
  )
);

-- Fix analytics_events table RLS policy
DROP POLICY IF EXISTS "Admins can manage analytics events" ON public.analytics_events;
CREATE POLICY "Admins can manage analytics events" ON public.analytics_events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid()) AND is_active = true
  )
);

-- Fix system_metrics table RLS policy
DROP POLICY IF EXISTS "Admins can manage system metrics" ON public.system_metrics;
CREATE POLICY "Admins can manage system metrics" ON public.system_metrics
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid()) AND is_active = true
  )
);

-- Fix admin_reports table RLS policy
DROP POLICY IF EXISTS "Admins can manage reports" ON public.admin_reports;
CREATE POLICY "Admins can manage reports" ON public.admin_reports
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid()) AND is_active = true
  )
);
