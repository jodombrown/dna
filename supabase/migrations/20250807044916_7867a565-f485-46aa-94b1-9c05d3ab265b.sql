-- Fix RLS performance issues
-- 1. Optimize auth function calls by wrapping in SELECT statements
-- 2. Consolidate multiple permissive policies into single efficient policies

-- First, drop existing problematic policies on posts table
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view their own posts regardless of status" ON public.posts;
DROP POLICY IF EXISTS "Posts are viewable by everyone or owners" ON public.posts;
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts or admins can delete any" ON public.posts;

-- Create optimized consolidated policies for posts table
CREATE POLICY "Posts SELECT policy" ON public.posts
FOR SELECT USING (
  visibility = 'public' OR 
  author_id = (SELECT auth.uid()) OR
  is_user_admin((SELECT auth.uid()))
);

CREATE POLICY "Posts INSERT policy" ON public.posts
FOR INSERT WITH CHECK (
  author_id = (SELECT auth.uid())
);

CREATE POLICY "Posts UPDATE policy" ON public.posts
FOR UPDATE USING (
  author_id = (SELECT auth.uid()) OR
  is_user_admin((SELECT auth.uid()))
);

CREATE POLICY "Posts DELETE policy" ON public.posts
FOR DELETE USING (
  author_id = (SELECT auth.uid()) OR
  is_user_admin((SELECT auth.uid()))
);

-- Fix saved_posts table policy
DROP POLICY IF EXISTS "Users can manage their own saved posts" ON public.saved_posts;

CREATE POLICY "Saved posts management policy" ON public.saved_posts
FOR ALL USING (
  user_id = (SELECT auth.uid())
) WITH CHECK (
  user_id = (SELECT auth.uid())
);