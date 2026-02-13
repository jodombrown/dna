
-- ============================================
-- 1. push_subscriptions: optimize auth.uid()
-- ============================================
DROP POLICY IF EXISTS "Users can view their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can view their own push subscriptions" ON public.push_subscriptions
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own push subscriptions" ON public.push_subscriptions
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own push subscriptions" ON public.push_subscriptions
  FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own push subscriptions" ON public.push_subscriptions
  FOR DELETE USING (user_id = (select auth.uid()));

-- ============================================
-- 2. space_roles: optimize + consolidate SELECT
-- ============================================
DROP POLICY IF EXISTS "Roles visible to space members" ON public.space_roles;
DROP POLICY IF EXISTS "Space leads can manage roles" ON public.space_roles;

-- Single consolidated SELECT policy
CREATE POLICY "Space members can view and leads can manage roles" ON public.space_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = space_roles.space_id
        AND sm.user_id = (select auth.uid())
    )
  );

-- Separate write policies for leads only
CREATE POLICY "Space leads can insert roles" ON public.space_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = space_roles.space_id
        AND sm.user_id = (select auth.uid())
        AND sm.role = 'lead'
    )
  );

CREATE POLICY "Space leads can update roles" ON public.space_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = space_roles.space_id
        AND sm.user_id = (select auth.uid())
        AND sm.role = 'lead'
    )
  );

CREATE POLICY "Space leads can delete roles" ON public.space_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = space_roles.space_id
        AND sm.user_id = (select auth.uid())
        AND sm.role = 'lead'
    )
  );

-- ============================================
-- 3. initiatives: optimize + consolidate
-- ============================================
DROP POLICY IF EXISTS "Allow read initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Initiatives visible to space members" ON public.initiatives;
DROP POLICY IF EXISTS "Space members can create initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Users can create initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Initiative creators and leads can update" ON public.initiatives;
DROP POLICY IF EXISTS "Users can update own initiatives" ON public.initiatives;

-- Consolidated SELECT
CREATE POLICY "Users can read initiatives" ON public.initiatives
  FOR SELECT USING (true);

-- Consolidated INSERT
CREATE POLICY "Authenticated users can create initiatives" ON public.initiatives
  FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Consolidated UPDATE
CREATE POLICY "Creators and leads can update initiatives" ON public.initiatives
  FOR UPDATE USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = initiatives.space_id
        AND sm.user_id = (select auth.uid())
        AND sm.role = 'lead'
    )
  );

-- ============================================
-- 4. milestones: optimize + consolidate
-- ============================================
DROP POLICY IF EXISTS "Members can view milestones in their spaces" ON public.milestones;
DROP POLICY IF EXISTS "Milestones visible to space members" ON public.milestones;
DROP POLICY IF EXISTS "Space members can manage milestones" ON public.milestones;
DROP POLICY IF EXISTS "Members can create milestones in their spaces" ON public.milestones;
DROP POLICY IF EXISTS "Creators or admins can update milestones" ON public.milestones;
DROP POLICY IF EXISTS "Creators or admins can delete milestones" ON public.milestones;

-- Consolidated SELECT
CREATE POLICY "Space members can view milestones" ON public.milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = milestones.space_id
        AND sm.user_id = (select auth.uid())
    )
  );

-- Consolidated INSERT
CREATE POLICY "Space members can create milestones" ON public.milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = milestones.space_id
        AND sm.user_id = (select auth.uid())
    )
  );

-- Consolidated UPDATE
CREATE POLICY "Creators or leads can update milestones" ON public.milestones
  FOR UPDATE USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = milestones.space_id
        AND sm.user_id = (select auth.uid())
        AND sm.role = 'lead'
    )
  );

-- Consolidated DELETE
CREATE POLICY "Creators or leads can delete milestones" ON public.milestones
  FOR DELETE USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = milestones.space_id
        AND sm.user_id = (select auth.uid())
        AND sm.role = 'lead'
    )
  );
