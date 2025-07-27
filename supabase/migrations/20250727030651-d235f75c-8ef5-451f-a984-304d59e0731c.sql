-- Fix database performance warnings from linter (final corrected version)
-- This migration addresses auth RLS initplan issues, duplicate policies, and duplicate constraints

-- 1. Fix auth RLS initplan issues by wrapping auth.uid() in SELECT statements
-- This prevents re-evaluation of auth functions for each row

-- Fix post_reactions policies
DROP POLICY IF EXISTS "Users can add their own reactions" ON public.post_reactions;
DROP POLICY IF EXISTS "Users can remove their own reactions" ON public.post_reactions;

CREATE POLICY "Users can add their own reactions" ON public.post_reactions
FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can remove their own reactions" ON public.post_reactions
FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Fix post_likes policies
DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Users can remove their own likes" ON public.post_likes;
DROP POLICY IF EXISTS "Likes are viewable for public posts" ON public.post_likes;

CREATE POLICY "Users can like posts" ON public.post_likes
FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can remove their own likes" ON public.post_likes
FOR DELETE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Likes are viewable for public posts" ON public.post_likes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_likes.post_id 
    AND posts.visibility = 'public'
  ) OR (SELECT auth.uid()) = user_id
);

-- Fix post_comments policies
DROP POLICY IF EXISTS "Users can comment on posts" ON public.post_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Comments are viewable for public posts" ON public.post_comments;

CREATE POLICY "Users can comment on posts" ON public.post_comments
FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own comments" ON public.post_comments
FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own comments" ON public.post_comments
FOR DELETE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Comments are viewable for public posts" ON public.post_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_comments.post_id 
    AND posts.visibility = 'public'
  ) OR (SELECT auth.uid()) = user_id
);

-- Fix user_connections policies (corrected column names)
DROP POLICY IF EXISTS "Users can view their connections" ON public.user_connections;
DROP POLICY IF EXISTS "Users can create their own connections" ON public.user_connections;
DROP POLICY IF EXISTS "Users can delete their own connections" ON public.user_connections;

CREATE POLICY "Users can view their connections" ON public.user_connections
FOR SELECT USING (
  (SELECT auth.uid()) = follower_id OR (SELECT auth.uid()) = following_id
);

CREATE POLICY "Users can create their own connections" ON public.user_connections
FOR INSERT WITH CHECK ((SELECT auth.uid()) = follower_id);

CREATE POLICY "Users can delete their own connections" ON public.user_connections
FOR DELETE USING ((SELECT auth.uid()) = follower_id);

-- 2. Fix saved_searches multiple permissive policies by consolidating them
DROP POLICY IF EXISTS "Users can create their own saved searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can view their own saved searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can update their own saved searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can delete their own saved searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can manage their own saved searches" ON public.saved_searches;

-- Create single comprehensive policy for saved_searches
CREATE POLICY "Users can manage their own saved searches" ON public.saved_searches
FOR ALL USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 3. Fix search_analytics multiple permissive policies
DROP POLICY IF EXISTS "Users can view their own search analytics" ON public.search_analytics;
DROP POLICY IF EXISTS "Users can insert their own search analytics" ON public.search_analytics;
DROP POLICY IF EXISTS "Users can create their own search analytics" ON public.search_analytics;

-- Create consolidated policies for search_analytics
CREATE POLICY "Users can view their own search analytics" ON public.search_analytics
FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own search analytics" ON public.search_analytics
FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- 4. Fix duplicate constraints on post_reactions
-- Drop one of the duplicate unique constraints to improve performance
ALTER TABLE public.post_reactions DROP CONSTRAINT IF EXISTS unique_user_emoji_post;