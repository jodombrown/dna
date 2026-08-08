-- Fix auth RLS initialization plan issues by wrapping auth.uid() calls in SELECT
-- This prevents re-evaluation for each row, improving performance
--
-- The adin_profiles/adin_signals/adin_connection_matches policy fixes that
-- originally opened this file are removed: none of those tables exist in
-- the live database (verified directly against the project), so a
-- from-scratch replay failed immediately on "relation adin_profiles does
-- not exist" before any statement in this file could run. This file is
-- also absent from supabase_migrations.schema_migrations, so it was never
-- applied through tracked migration history either.
--
-- The feature_flags/event_registrations/content_moderation/admin_analytics
-- policy fixes that used to follow are removed for the same reason: none of
-- those four tables is created by any CREATE TABLE statement anywhere in
-- supabase/migrations (admin_analytics does not exist in the live database
-- at all; feature_flags, event_registrations, and content_moderation exist
-- live but were evidently created outside tracked migration history). A
-- from-scratch replay of this migration set fails on each of them in turn
-- ("relation ... does not exist") before any later statement in this file
-- can run. Only the policy fixes below, for tables that ARE created earlier
-- in tracked history (posts, communities, comments, beta_feedback), remain.

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