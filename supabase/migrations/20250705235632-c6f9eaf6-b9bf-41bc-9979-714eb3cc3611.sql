-- Fix RLS performance issues by optimizing auth function calls and consolidating policies

-- 1. Fix users table policies
DROP POLICY IF EXISTS "Users can insert their own record" ON public.users;
DROP POLICY IF EXISTS "Users can update their own record" ON public.users;
DROP POLICY IF EXISTS "Users can view their own record and public profiles" ON public.users;

CREATE POLICY "Users can insert their own record" 
ON public.users 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own record" 
ON public.users 
FOR UPDATE 
USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can view their own record and public profiles" 
ON public.users 
FOR SELECT 
USING (((SELECT auth.uid()) = id) OR (bio IS NOT NULL));

-- 2. Fix posts table policies and consolidate redundant SELECT policies
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

-- Consolidate into single SELECT policy
CREATE POLICY "Posts are viewable by everyone or owners" 
ON public.posts 
FOR SELECT 
USING (visibility = 'public'::text OR (SELECT auth.uid()) = author_id);

CREATE POLICY "Users can create their own posts" 
ON public.posts 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = author_id);

CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
USING ((SELECT auth.uid()) = author_id);

CREATE POLICY "Users can delete their own posts" 
ON public.posts 
FOR DELETE 
USING ((SELECT auth.uid()) = author_id);

-- 3. Fix reactions table policies
DROP POLICY IF EXISTS "Users can create their own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can update their own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.reactions;

CREATE POLICY "Users can create their own reactions" 
ON public.reactions 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own reactions" 
ON public.reactions 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON public.reactions 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);

-- 4. Fix comments table policies
DROP POLICY IF EXISTS "Users can create their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

CREATE POLICY "Users can create their own comments" 
ON public.comments 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = author_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING ((SELECT auth.uid()) = author_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING ((SELECT auth.uid()) = author_id);

-- 5. Fix user_communities table policies
DROP POLICY IF EXISTS "Users can create their own communities" ON public.user_communities;
DROP POLICY IF EXISTS "Users can update their own communities" ON public.user_communities;
DROP POLICY IF EXISTS "Users can delete their own communities" ON public.user_communities;

CREATE POLICY "Users can create their own communities" 
ON public.user_communities 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can update their own communities" 
ON public.user_communities 
FOR UPDATE 
USING ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can delete their own communities" 
ON public.user_communities 
FOR DELETE 
USING ((SELECT auth.uid()) = owner_id);