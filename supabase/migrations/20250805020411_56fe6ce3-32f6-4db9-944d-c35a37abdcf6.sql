-- Fix RLS performance issues by optimizing auth function calls
-- This prevents re-evaluation of auth.uid() for each row

-- Drop existing policies to recreate them with optimized auth calls
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Users can create their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments or admins can delete any" ON public.comments;

DROP POLICY IF EXISTS "Posts are viewable by everyone or owners" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts or admins can delete any" ON public.posts;

DROP POLICY IF EXISTS "Community members can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authors and community admins can delete posts" ON public.community_posts;

-- Recreate comments policies with optimized auth calls
CREATE POLICY "Comments are viewable by everyone" 
ON public.comments FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own comments" 
ON public.comments FOR INSERT 
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments FOR UPDATE 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own comments or admins can delete any" 
ON public.comments FOR DELETE 
USING ((select auth.uid()) = user_id OR public.is_admin_user((select auth.uid())));

-- Recreate posts policies with optimized auth calls
CREATE POLICY "Posts are viewable by everyone or owners" 
ON public.posts FOR SELECT 
USING (visibility = 'public' OR (select auth.uid()) = author_id);

CREATE POLICY "Users can create their own posts" 
ON public.posts FOR INSERT 
WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Users can update their own posts" 
ON public.posts FOR UPDATE 
USING ((select auth.uid()) = author_id);

CREATE POLICY "Users can delete their own posts or admins can delete any" 
ON public.posts FOR DELETE 
USING ((select auth.uid()) = author_id OR public.is_admin_user((select auth.uid())));

-- Recreate community_posts policies with optimized auth calls
CREATE POLICY "Community members can create posts" 
ON public.community_posts FOR INSERT 
WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Authors can update their own posts" 
ON public.community_posts FOR UPDATE 
USING ((select auth.uid()) = author_id);

CREATE POLICY "Authors and community admins can delete posts" 
ON public.community_posts FOR DELETE 
USING ((select auth.uid()) = author_id OR public.is_admin_user((select auth.uid())));