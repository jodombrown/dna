-- Fix remaining multiple permissive policies by consolidating them

-- Fix invites policies by consolidating multiple permissive policies
DROP POLICY IF EXISTS "Admins can view all invites" ON public.invites;
DROP POLICY IF EXISTS "Anyone can view their own invite" ON public.invites;

-- Create a single consolidated policy for viewing invites
CREATE POLICY "View invites policy" 
ON public.invites 
FOR SELECT 
USING (
  (email = (SELECT users.email FROM auth.users WHERE users.id = (select auth.uid()))::text) OR 
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