-- Optimize RLS policies for group_join_requests and group_posts to use (select auth.uid())
-- Improves performance by avoiding per-row re-evaluation of auth functions

-- GROUP JOIN REQUESTS
DROP POLICY IF EXISTS "Users can view their own join requests" ON public.group_join_requests;
CREATE POLICY "Users can view their own join requests" ON public.group_join_requests
FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view group join requests" ON public.group_join_requests;
CREATE POLICY "Admins can view group join requests" ON public.group_join_requests
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_join_requests.group_id
      AND gm.user_id = (select auth.uid())
      AND gm.role IN ('owner','admin')
      AND gm.is_banned = false
  )
);

DROP POLICY IF EXISTS "Users can create join requests" ON public.group_join_requests;
CREATE POLICY "Users can create join requests" ON public.group_join_requests
FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can update join requests" ON public.group_join_requests;
CREATE POLICY "Admins can update join requests" ON public.group_join_requests
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_join_requests.group_id
      AND gm.user_id = (select auth.uid())
      AND gm.role IN ('owner','admin')
      AND gm.is_banned = false
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_join_requests.group_id
      AND gm.user_id = (select auth.uid())
      AND gm.role IN ('owner','admin')
      AND gm.is_banned = false
  )
);

-- GROUP POSTS
DROP POLICY IF EXISTS "Members can create posts" ON public.group_posts;
CREATE POLICY "Members can create posts" ON public.group_posts
FOR INSERT WITH CHECK (
  author_id = (select auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_posts.group_id
      AND gm.user_id = (select auth.uid())
      AND gm.is_banned = false
  )
);
