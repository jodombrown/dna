-- Fix post_views SELECT policy using join to posts for author access
DROP POLICY IF EXISTS "Authors or viewers (or admins) can read post views" ON public.post_views;
CREATE POLICY "Authors or viewers (or admins) can read post views"
  ON public.post_views FOR SELECT
  USING (
    (select auth.uid()) = viewer_id
    OR EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_views.post_id
        AND p.author_id = (select auth.uid())
    )
    OR public.is_admin_user((select auth.uid()))
  );