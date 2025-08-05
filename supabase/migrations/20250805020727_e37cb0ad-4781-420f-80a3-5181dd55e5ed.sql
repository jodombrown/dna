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
USING (
  (EXISTS ( SELECT 1
   FROM posts
  WHERE ((posts.id = comments.post_id) AND (posts.visibility = 'public'::text)))) 
  OR 
  (EXISTS ( SELECT 1
   FROM posts
  WHERE ((posts.id = comments.post_id) AND (posts.author_id = (select auth.uid())))))
);

CREATE POLICY "Users can create their own comments" 
ON public.comments FOR INSERT 
WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments FOR UPDATE 
USING ((select auth.uid()) = author_id);

CREATE POLICY "Users can delete their own comments or admins can delete any" 
ON public.comments FOR DELETE 
USING ((select auth.uid()) = author_id OR public.is_user_admin((select auth.uid())));

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
WITH CHECK (
  (select auth.uid()) = author_id 
  AND 
  ((EXISTS ( SELECT 1
   FROM community_memberships cm
  WHERE ((cm.community_id = community_posts.community_id) AND (cm.user_id = (select auth.uid())) AND (cm.status = 'approved'::text)))) 
  OR 
  (EXISTS ( SELECT 1
   FROM communities c
  WHERE ((c.id = community_posts.community_id) AND (c.created_by = (select auth.uid()))))))
);

CREATE POLICY "Authors can update their own posts" 
ON public.community_posts FOR UPDATE 
USING ((select auth.uid()) = author_id);

CREATE POLICY "Authors and community admins can delete posts" 
ON public.community_posts FOR DELETE 
USING (
  (select auth.uid()) = author_id 
  OR 
  (EXISTS ( SELECT 1
   FROM communities c
  WHERE ((c.id = community_posts.community_id) AND (c.created_by = (select auth.uid()))))) 
  OR 
  (EXISTS ( SELECT 1
   FROM community_memberships cm
  WHERE ((cm.community_id = community_posts.community_id) AND (cm.user_id = (select auth.uid())) AND (cm.role = 'admin'::text))))
);