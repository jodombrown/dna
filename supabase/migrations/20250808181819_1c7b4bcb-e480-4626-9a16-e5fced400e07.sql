-- Ensure membership helper exists (idempotent)
create or replace function public.is_member_of_space(_space uuid, _user uuid, _roles text[] default array['owner','admin','member'], _approved_only boolean default true)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.collaboration_memberships m
    where m.space_id = _space
      and m.user_id = _user
      and (coalesce(_roles, array['owner','admin','member']) is null or m.role = any(_roles))
      and (not _approved_only or m.status = 'approved')
  );
$$;
revoke all on function public.is_member_of_space(uuid,uuid,text[],boolean) from public;
grant execute on function public.is_member_of_space(uuid,uuid,text[],boolean) to authenticated;

-- =============================================
-- Rewrite collaboration_memberships policies to use (select auth.uid())
-- SELECT
DROP POLICY IF EXISTS "Read memberships for approved members" ON public.collaboration_memberships;
CREATE POLICY "Read memberships for approved members"
  ON public.collaboration_memberships FOR SELECT
  USING (
    public.is_member_of_space(space_id, (select auth.uid()), array['owner','admin','member'], true)
  );

-- INSERT
DROP POLICY IF EXISTS "Insert membership by self or admin" ON public.collaboration_memberships;
CREATE POLICY "Insert membership by self or admin"
  ON public.collaboration_memberships FOR INSERT
  WITH CHECK (
    (select auth.uid()) = user_id
    OR public.is_member_of_space(space_id, (select auth.uid()), array['owner','admin'], true)
  );

-- UPDATE
DROP POLICY IF EXISTS "Update membership by self or admin" ON public.collaboration_memberships;
CREATE POLICY "Update membership by self or admin"
  ON public.collaboration_memberships FOR UPDATE
  USING (
    (select auth.uid()) = user_id
    OR public.is_member_of_space(space_id, (select auth.uid()), array['owner','admin'], true)
  )
  WITH CHECK (
    (select auth.uid()) = user_id
    OR public.is_member_of_space(space_id, (select auth.uid()), array['owner','admin'], true)
  );

-- DELETE
DROP POLICY IF EXISTS "Delete membership by self or admin" ON public.collaboration_memberships;
CREATE POLICY "Delete membership by self or admin"
  ON public.collaboration_memberships FOR DELETE
  USING (
    (select auth.uid()) = user_id
    OR public.is_member_of_space(space_id, (select auth.uid()), array['owner','admin'], true)
  );

-- =============================================
-- Rewrite post_views policies to use (select auth.uid())
-- INSERT (viewer can insert their own view)
DROP POLICY IF EXISTS "Users can insert their own post views" ON public.post_views;
CREATE POLICY "Users can insert their own post views"
  ON public.post_views FOR INSERT
  WITH CHECK (
    (select auth.uid()) = viewer_id
  );

-- SELECT (author, viewer, or admin can read)
DROP POLICY IF EXISTS "Authors or viewers (or admins) can read post views" ON public.post_views;
CREATE POLICY "Authors or viewers (or admins) can read post views"
  ON public.post_views FOR SELECT
  USING (
    (select auth.uid()) = viewer_id
    OR (select auth.uid()) = author_id
    OR public.is_admin_user((select auth.uid()))
  );

-- =============================================
-- Consolidate duplicate notifications INSERT policies
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
-- Keep remaining insert policy as-is (intentionally not recreated here)