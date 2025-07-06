-- Continue fixing remaining RLS policies for performance optimization

-- Fix impact_log policies and consolidate multiple permissive policies
DROP POLICY IF EXISTS "Users can view their own impact" ON public.impact_log;
DROP POLICY IF EXISTS "Admins can view all impact logs" ON public.impact_log;

-- Create a single consolidated policy for viewing impact logs
CREATE POLICY "View impact logs policy" 
ON public.impact_log 
FOR SELECT 
USING (
  ((select auth.uid()) = user_id) OR
  (EXISTS ( 
    SELECT 1
    FROM profiles
    WHERE ((profiles.id = (select auth.uid())) AND ((profiles.email = 'admin@diasporanetwork.africa'::text) OR (profiles.email ~~ '%@diasporanetwork.africa'::text)))
  ))
);

-- Fix referrals policies
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
CREATE POLICY "Users can view their own referrals" 
ON public.referrals 
FOR SELECT 
USING ((select auth.uid()) = referrer_id);

DROP POLICY IF EXISTS "Authenticated users can create referrals" ON public.referrals;
CREATE POLICY "Authenticated users can create referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK ((select auth.uid()) = referrer_id);

-- Fix launch_config policy
DROP POLICY IF EXISTS "Admins can update launch config" ON public.launch_config;
CREATE POLICY "Admins can update launch config" 
ON public.launch_config 
FOR UPDATE 
USING (EXISTS ( 
  SELECT 1
  FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND ((profiles.email = 'admin@diasporanetwork.africa'::text) OR (profiles.email ~~ '%@diasporanetwork.africa'::text)))
));