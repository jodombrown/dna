BEGIN;

-- collaboration_memberships: rewrite policies to wrap auth.uid() in SELECT
DROP POLICY IF EXISTS "Read memberships for approved members" ON public.collaboration_memberships;
CREATE POLICY "Read memberships for approved members"
  ON public.collaboration_memberships FOR SELECT
  USING (
    public.is_member_of_space(space_id, (select auth.uid()), ARRAY['owner','admin','member'], true)
  );

DROP POLICY IF EXISTS "Insert membership by self or admin" ON public.collaboration_memberships;
CREATE POLICY "Insert membership by self or admin"
  ON public.collaboration_memberships FOR INSERT
  WITH CHECK (
    (select auth.uid()) = user_id
    OR public.is_member_of_space(space_id, (select auth.uid()), ARRAY['owner','admin'], true)
  );

DROP POLICY IF EXISTS "Update membership by self or admin" ON public.collaboration_memberships;
CREATE POLICY "Update membership by self or admin"
  ON public.collaboration_memberships FOR UPDATE
  USING (
    (select auth.uid()) = user_id
    OR public.is_member_of_space(space_id, (select auth.uid()), ARRAY['owner','admin'], true)
  )
  WITH CHECK (
    (select auth.uid()) = user_id
    OR public.is_member_of_space(space_id, (select auth.uid()), ARRAY['owner','admin'], true)
  );

DROP POLICY IF EXISTS "Delete membership by self or admin" ON public.collaboration_memberships;
CREATE POLICY "Delete membership by self or admin"
  ON public.collaboration_memberships FOR DELETE
  USING (
    (select auth.uid()) = user_id
    OR public.is_member_of_space(space_id, (select auth.uid()), ARRAY['owner','admin'], true)
  );

-- post_views: fix INSERT policy to wrap auth.uid()
DROP POLICY IF EXISTS "Users can insert their own post views" ON public.post_views;
CREATE POLICY "Users can insert their own post views"
  ON public.post_views FOR INSERT
  WITH CHECK (
    (select auth.uid()) = viewer_id
  );

-- Ensure SELECT policy remains correct and uses SELECT wrapper
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

-- notifications: drop duplicate permissive INSERT policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

COMMIT;