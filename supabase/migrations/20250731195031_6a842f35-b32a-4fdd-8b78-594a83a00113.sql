-- Fix remaining auth RLS initialization plan issues and multiple permissive policies

-- Fix user_contributions policies
DROP POLICY IF EXISTS "Users can view their own contributions, admins can view all" ON public.user_contributions;
DROP POLICY IF EXISTS "Users can create their own contributions" ON public.user_contributions;
DROP POLICY IF EXISTS "Users can update their own contributions" ON public.user_contributions;

CREATE POLICY "User contributions read access" 
ON public.user_contributions 
FOR SELECT 
USING ((user_id = (SELECT auth.uid())) OR is_user_admin((SELECT auth.uid())));

CREATE POLICY "Users can create their own contributions" 
ON public.user_contributions 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own contributions" 
ON public.user_contributions 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);

-- Fix verified_contributors policies - consolidate multiple permissive policies
DROP POLICY IF EXISTS "Users can view their own verification status" ON public.verified_contributors;
DROP POLICY IF EXISTS "Only admins can manage verified contributors" ON public.verified_contributors;

CREATE POLICY "Verified contributors read access" 
ON public.verified_contributors 
FOR SELECT 
USING ((user_id = (SELECT auth.uid())) OR is_user_admin((SELECT auth.uid())));

CREATE POLICY "Only admins can modify verified contributors" 
ON public.verified_contributors 
FOR ALL 
USING (is_user_admin((SELECT auth.uid())));

-- Fix newsletter_subscriptions policies
DROP POLICY IF EXISTS "Users can view their own newsletter subscription" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can update their own newsletter subscription" ON public.newsletter_subscriptions;

CREATE POLICY "Users can view their own newsletter subscription" 
ON public.newsletter_subscriptions 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own newsletter subscription" 
ON public.newsletter_subscriptions 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);

-- Fix invites policy
DROP POLICY IF EXISTS "Admins can create invites or users with limits" ON public.invites;
CREATE POLICY "Admins can create invites or users with limits" 
ON public.invites 
FOR INSERT 
WITH CHECK (is_user_admin((SELECT auth.uid())) OR (
  (SELECT auth.uid()) IS NOT NULL AND 
  (SELECT COUNT(*) FROM public.invites WHERE created_by = (SELECT auth.uid())) < 5
));

-- Fix feature_flags multiple permissive policies - ensure only one policy per action
DROP POLICY IF EXISTS "Only admins can modify feature flags" ON public.feature_flags;
CREATE POLICY "Admins can modify feature flags" 
ON public.feature_flags 
FOR INSERT, UPDATE, DELETE 
USING (is_admin_user((SELECT auth.uid())));