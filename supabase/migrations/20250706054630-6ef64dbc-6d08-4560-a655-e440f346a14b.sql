-- Fix performance issues in RLS policies by optimizing auth function calls
-- Replace auth.uid() with (select auth.uid()) to prevent re-evaluation for each row

-- Fix waitlist_signups policies
DROP POLICY IF EXISTS "Admins can view all waitlist entries" ON public.waitlist_signups;
CREATE POLICY "Admins can view all waitlist entries" 
ON public.waitlist_signups 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1
  FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND ((profiles.email = 'admin@diasporanetwork.africa'::text) OR (profiles.email ~~ '%@diasporanetwork.africa'::text)))
));

DROP POLICY IF EXISTS "Admins can update waitlist status" ON public.waitlist_signups;
CREATE POLICY "Admins can update waitlist status" 
ON public.waitlist_signups 
FOR UPDATE 
USING (EXISTS ( 
  SELECT 1
  FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND ((profiles.email = 'admin@diasporanetwork.africa'::text) OR (profiles.email ~~ '%@diasporanetwork.africa'::text)))
));

-- Fix invites policies
DROP POLICY IF EXISTS "Admins can create invites" ON public.invites;
CREATE POLICY "Admins can create invites" 
ON public.invites 
FOR INSERT 
WITH CHECK (EXISTS ( 
  SELECT 1
  FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND ((profiles.email = 'admin@diasporanetwork.africa'::text) OR (profiles.email ~~ '%@diasporanetwork.africa'::text)))
));

DROP POLICY IF EXISTS "Anyone can view their own invite" ON public.invites;
CREATE POLICY "Anyone can view their own invite" 
ON public.invites 
FOR SELECT 
USING ((email = (( SELECT users.email
  FROM auth.users
  WHERE (users.id = (select auth.uid())))))::text) OR ((select auth.uid()) IS NULL));

DROP POLICY IF EXISTS "Admins can view all invites" ON public.invites;
CREATE POLICY "Admins can view all invites" 
ON public.invites 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1
  FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND ((profiles.email = 'admin@diasporanetwork.africa'::text) OR (profiles.email ~~ '%@diasporanetwork.africa'::text)))
));

-- Fix user_feedback policies
DROP POLICY IF EXISTS "Users can create their own feedback" ON public.user_feedback;
CREATE POLICY "Users can create their own feedback" 
ON public.user_feedback 
FOR INSERT 
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own feedback" ON public.user_feedback;
CREATE POLICY "Users can view their own feedback" 
ON public.user_feedback 
FOR SELECT 
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can view all feedback" ON public.user_feedback;
CREATE POLICY "Admins can view all feedback" 
ON public.user_feedback 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1
  FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND ((profiles.email = 'admin@diasporanetwork.africa'::text) OR (profiles.email ~~ '%@diasporanetwork.africa'::text)))
));

DROP POLICY IF EXISTS "Admins can update feedback" ON public.user_feedback;
CREATE POLICY "Admins can update feedback" 
ON public.user_feedback 
FOR UPDATE 
USING (EXISTS ( 
  SELECT 1
  FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND ((profiles.email = 'admin@diasporanetwork.africa'::text) OR (profiles.email ~~ '%@diasporanetwork.africa'::text)))
));

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

-- Fix invites policies by consolidating multiple permissive policies
DROP POLICY IF EXISTS "Admins can view all invites" ON public.invites;
DROP POLICY IF EXISTS "Anyone can view their own invite" ON public.invites;

-- Create a single consolidated policy for viewing invites
CREATE POLICY "View invites policy" 
ON public.invites 
FOR SELECT 
USING (
  ((email = (( SELECT users.email FROM auth.users WHERE (users.id = (select auth.uid())))))::text) OR 
  ((select auth.uid()) IS NULL) OR
  (EXISTS ( 
    SELECT 1
    FROM profiles
    WHERE ((profiles.id = (select auth.uid())) AND ((profiles.email = 'admin@diasporanetwork.africa'::text) OR (profiles.email ~~ '%@diasporanetwork.africa'::text)))
  ))
);

-- Fix user_feedback policies by consolidating multiple permissive policies
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.user_feedback;

-- Create a single consolidated policy for viewing user feedback
CREATE POLICY "View user feedback policy" 
ON public.user_feedback 
FOR SELECT 
USING (
  ((select auth.uid()) = user_id) OR
  (EXISTS ( 
    SELECT 1
    FROM profiles
    WHERE ((profiles.id = (select auth.uid())) AND ((profiles.email = 'admin@diasporanetwork.africa'::text) OR (profiles.email ~~ '%@diasporanetwork.africa'::text)))
  ))
);