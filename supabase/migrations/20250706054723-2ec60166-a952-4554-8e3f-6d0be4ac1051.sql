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