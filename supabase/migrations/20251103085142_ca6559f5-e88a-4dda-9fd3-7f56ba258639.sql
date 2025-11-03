-- Consolidate remaining multiple permissive policies and remove duplicate indexes

-- POST_COMMENTS: Consolidate duplicate INSERT policies (uses user_id not author_id)
DROP POLICY IF EXISTS "Users can create comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can create own comments" ON public.post_comments;

CREATE POLICY "Users can create comments" ON public.post_comments
FOR INSERT WITH CHECK (user_id = (select auth.uid()));

-- POST_COMMENTS: Consolidate duplicate SELECT policies
DROP POLICY IF EXISTS "Anyone can view post comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can view comments on visible posts" ON public.post_comments;

CREATE POLICY "Users can view post comments" ON public.post_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = post_comments.post_id
      AND (
        p.privacy_level = 'public' OR
        p.author_id = (select auth.uid()) OR
        (p.privacy_level = 'connections' AND EXISTS (
          SELECT 1 FROM public.connections c
          WHERE ((c.requester_id = (select auth.uid()) AND c.recipient_id = p.author_id) OR
                 (c.recipient_id = (select auth.uid()) AND c.requester_id = p.author_id))
            AND c.status = 'accepted'
        ))
      )
  )
);

-- POST_LIKES: Consolidate duplicate INSERT policies
DROP POLICY IF EXISTS "Users can create likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users like posts" ON public.post_likes;

CREATE POLICY "Users can create likes" ON public.post_likes
FOR INSERT WITH CHECK (user_id = (select auth.uid()));

-- POST_LIKES: Consolidate duplicate DELETE policies
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users unlike posts" ON public.post_likes;

CREATE POLICY "Users can delete their likes" ON public.post_likes
FOR DELETE USING (user_id = (select auth.uid()));

-- POST_LIKES: Consolidate duplicate SELECT policies
DROP POLICY IF EXISTS "Post likes viewable if post viewable" ON public.post_likes;
DROP POLICY IF EXISTS "Users can view likes on visible posts" ON public.post_likes;

CREATE POLICY "Users can view post likes" ON public.post_likes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = post_likes.post_id
      AND (
        p.privacy_level = 'public' OR
        p.author_id = (select auth.uid()) OR
        (p.privacy_level = 'connections' AND EXISTS (
          SELECT 1 FROM public.connections c
          WHERE ((c.requester_id = (select auth.uid()) AND c.recipient_id = p.author_id) OR
                 (c.recipient_id = (select auth.uid()) AND c.requester_id = p.author_id))
            AND c.status = 'accepted'
        ))
      )
  )
);

-- POSTS: Consolidate duplicate INSERT policies
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users create own posts" ON public.posts;

CREATE POLICY "Users can create posts" ON public.posts
FOR INSERT WITH CHECK (author_id = (select auth.uid()));

-- POSTS: Consolidate 4 SELECT policies into 1
DROP POLICY IF EXISTS "Anyone can view public posts" ON public.posts;
DROP POLICY IF EXISTS "Public posts viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view connection posts" ON public.posts;

CREATE POLICY "Users can view accessible posts" ON public.posts
FOR SELECT USING (
  privacy_level = 'public' OR
  author_id = (select auth.uid()) OR
  (privacy_level = 'connections' AND EXISTS (
    SELECT 1 FROM public.connections c
    WHERE ((c.requester_id = (select auth.uid()) AND c.recipient_id = posts.author_id) OR
           (c.recipient_id = (select auth.uid()) AND c.requester_id = posts.author_id))
      AND c.status = 'accepted'
  ))
);

-- POSTS: Consolidate duplicate UPDATE policies
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users update own posts" ON public.posts;

CREATE POLICY "Users can update their posts" ON public.posts
FOR UPDATE USING (author_id = (select auth.uid()));

-- Remove duplicate indexes
DROP INDEX IF EXISTS public.idx_post_comments_user;
DROP INDEX IF EXISTS public.idx_posts_created;
DROP INDEX IF EXISTS public.idx_posts_privacy;