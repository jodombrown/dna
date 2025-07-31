-- Fix auth RLS initialization plan issues by wrapping auth.uid() calls in SELECT
-- This prevents re-evaluation for each row, improving performance

-- Fix adin_profiles policy
DROP POLICY IF EXISTS "Users can view and update their own ADIN profile" ON public.adin_profiles;
CREATE POLICY "Users can view and update their own ADIN profile" 
ON public.adin_profiles 
FOR ALL 
USING ((id = (SELECT auth.uid())) OR is_user_admin((SELECT auth.uid())));

-- Fix adin_signals policy
DROP POLICY IF EXISTS "Users can view and update their own signals" ON public.adin_signals;
CREATE POLICY "Users can view and update their own signals" 
ON public.adin_signals 
FOR ALL 
USING ((user_id = (SELECT auth.uid())) OR is_user_admin((SELECT auth.uid())));

-- Fix adin_connection_matches policy
DROP POLICY IF EXISTS "Users can view their own matches" ON public.adin_connection_matches;
CREATE POLICY "Users can view their own matches" 
ON public.adin_connection_matches 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

-- Fix feature_flags policies - consolidate multiple permissive policies
DROP POLICY IF EXISTS "Feature flags are viewable by everyone" ON public.feature_flags;
DROP POLICY IF EXISTS "Only admins can modify feature flags" ON public.feature_flags;
CREATE POLICY "Feature flags read access" 
ON public.feature_flags 
FOR SELECT 
USING (true);
CREATE POLICY "Only admins can modify feature flags" 
ON public.feature_flags 
FOR ALL 
USING (is_admin_user((SELECT auth.uid())));

-- Fix event_registrations policies - consolidate multiple permissive policies
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins can view all event registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can create their own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can update their own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can delete their own registrations" ON public.event_registrations;

CREATE POLICY "Event registrations read access" 
ON public.event_registrations 
FOR SELECT 
USING ((user_id = (SELECT auth.uid())) OR is_user_admin((SELECT auth.uid())));

CREATE POLICY "Users can create their own registrations" 
ON public.event_registrations 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own registrations" 
ON public.event_registrations 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own registrations" 
ON public.event_registrations 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);

-- Fix posts policy
DROP POLICY IF EXISTS "Users can delete their own posts or admins can delete any" ON public.posts;
CREATE POLICY "Users can delete their own posts or admins can delete any" 
ON public.posts 
FOR DELETE 
USING ((author_id = (SELECT auth.uid())) OR is_user_admin((SELECT auth.uid())));

-- Fix communities policy
DROP POLICY IF EXISTS "Users can delete own communities or admins can delete any" ON public.communities;
CREATE POLICY "Users can delete own communities or admins can delete any" 
ON public.communities 
FOR DELETE 
USING ((created_by = (SELECT auth.uid())) OR is_user_admin((SELECT auth.uid())));

-- Fix comments policy
DROP POLICY IF EXISTS "Users can delete their own comments or admins can delete any" ON public.comments;
CREATE POLICY "Users can delete their own comments or admins can delete any" 
ON public.comments 
FOR DELETE 
USING ((author_id = (SELECT auth.uid())) OR is_user_admin((SELECT auth.uid())));

-- Fix beta_feedback policy
DROP POLICY IF EXISTS "Users can create and view own feedback, admins can view all" ON public.beta_feedback;
CREATE POLICY "Users can create and view own feedback, admins can view all" 
ON public.beta_feedback 
FOR SELECT 
USING ((user_id = (SELECT auth.uid())) OR is_user_admin((SELECT auth.uid())));

-- Fix content_moderation policy
DROP POLICY IF EXISTS "Only admins can access content moderation" ON public.content_moderation;
CREATE POLICY "Only admins can access content moderation" 
ON public.content_moderation 
FOR ALL 
USING (is_user_admin((SELECT auth.uid())));

-- Fix admin_analytics policy
DROP POLICY IF EXISTS "Only admins can access admin analytics" ON public.admin_analytics;
CREATE POLICY "Only admins can access admin analytics" 
ON public.admin_analytics 
FOR ALL 
USING (is_user_admin((SELECT auth.uid())));