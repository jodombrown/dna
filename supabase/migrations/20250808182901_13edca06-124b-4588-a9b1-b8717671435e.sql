BEGIN;

-- Helper to avoid RLS recursion and wrap auth.uid()
CREATE OR REPLACE FUNCTION public.is_member_of_space(
  p_space_id uuid,
  p_user_id uuid,
  allowed_roles text[] DEFAULT ARRAY['owner','admin','member'],
  require_approved boolean DEFAULT true
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.collaboration_memberships m
    WHERE m.space_id = p_space_id
      AND m.user_id = p_user_id
      AND (allowed_roles IS NULL OR m.role = ANY(allowed_roles))
      AND (require_approved IS FALSE OR m.status = 'approved')
  );
$function$;

-- collaboration_memberships policies
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

-- post_views policies (wrap auth.uid() and ensure author access via join)
DROP POLICY IF EXISTS "Users can insert their own post views" ON public.post_views;
CREATE POLICY "Users can insert their own post views"
  ON public.post_views FOR INSERT
  WITH CHECK (
    (select auth.uid()) = viewer_id
  );

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

-- notifications: consolidate duplicate INSERT policies
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

COMMIT;