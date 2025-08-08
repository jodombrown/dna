-- Normalize RLS policies to use (SELECT auth.uid()) pattern and remove duplicates per linter

-- user_badges
DROP POLICY IF EXISTS "Users can view their own badges" ON public.user_badges;
CREATE POLICY "Users can view their own badges"
ON public.user_badges
FOR SELECT
USING ((user_id = (SELECT auth.uid() AS uid)) OR is_admin_user((SELECT auth.uid() AS uid)));

-- user_contributions: clean duplicates and standardize
DROP POLICY IF EXISTS "Users can create their own contributions" ON public.user_contributions;
DROP POLICY IF EXISTS "Users can insert their own contributions" ON public.user_contributions;
DROP POLICY IF EXISTS "User contributions read access" ON public.user_contributions;
DROP POLICY IF EXISTS "Users can view their own contributions" ON public.user_contributions;
DROP POLICY IF EXISTS "Users can update their own contributions" ON public.user_contributions;

CREATE POLICY "Users can insert their own contributions"
ON public.user_contributions
FOR INSERT
WITH CHECK ((SELECT auth.uid() AS uid) = user_id);

CREATE POLICY "Users can view their own contributions"
ON public.user_contributions
FOR SELECT
USING (user_id = (SELECT auth.uid() AS uid));

CREATE POLICY "Users can update their own contributions"
ON public.user_contributions
FOR UPDATE
USING ((SELECT auth.uid() AS uid) = user_id);

-- collaboration_spaces
DROP POLICY IF EXISTS "Public can view public spaces or members can view" ON public.collaboration_spaces;
CREATE POLICY "Public can view public spaces or members can view"
ON public.collaboration_spaces
FOR SELECT
USING (
  visibility = 'public'
  OR EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = collaboration_spaces.id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.status = 'approved'
  )
);

DROP POLICY IF EXISTS "Users can create their own spaces" ON public.collaboration_spaces;
CREATE POLICY "Users can create their own spaces"
ON public.collaboration_spaces
FOR INSERT
WITH CHECK (created_by = (SELECT auth.uid() AS uid));

DROP POLICY IF EXISTS "Owners/admins can update spaces" ON public.collaboration_spaces;
CREATE POLICY "Owners/admins can update spaces"
ON public.collaboration_spaces
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = collaboration_spaces.id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.role = ANY(ARRAY['owner','admin'])
      AND m.status = 'approved'
  )
);

DROP POLICY IF EXISTS "Owners/admins can delete spaces" ON public.collaboration_spaces;
CREATE POLICY "Owners/admins can delete spaces"
ON public.collaboration_spaces
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = collaboration_spaces.id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.role = ANY(ARRAY['owner','admin'])
      AND m.status = 'approved'
  )
);

-- collaboration_memberships
DROP POLICY IF EXISTS "Members can view memberships of their spaces" ON public.collaboration_memberships;
CREATE POLICY "Members can view memberships of their spaces"
ON public.collaboration_memberships
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = collaboration_memberships.space_id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.status = 'approved'
  )
);

DROP POLICY IF EXISTS "Owners/admins can add memberships or users can request" ON public.collaboration_memberships;
CREATE POLICY "Owners/admins can add memberships or users can request"
ON public.collaboration_memberships
FOR INSERT
WITH CHECK (
  user_id = (SELECT auth.uid() AS uid)
  OR EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = collaboration_memberships.space_id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.role = ANY(ARRAY['owner','admin'])
      AND m.status = 'approved'
  )
);

DROP POLICY IF EXISTS "Owners/admins or self can update memberships" ON public.collaboration_memberships;
CREATE POLICY "Owners/admins or self can update memberships"
ON public.collaboration_memberships
FOR UPDATE
USING (
  user_id = (SELECT auth.uid() AS uid)
  OR EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = collaboration_memberships.space_id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.role = ANY(ARRAY['owner','admin'])
      AND m.status = 'approved'
  )
);

DROP POLICY IF EXISTS "Owners/admins or self can delete memberships" ON public.collaboration_memberships;
CREATE POLICY "Owners/admins or self can delete memberships"
ON public.collaboration_memberships
FOR DELETE
USING (
  user_id = (SELECT auth.uid() AS uid)
  OR EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = collaboration_memberships.space_id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.role = ANY(ARRAY['owner','admin'])
      AND m.status = 'approved'
  )
);

-- tasks
DROP POLICY IF EXISTS "Members can view tasks in their spaces" ON public.tasks;
CREATE POLICY "Members can view tasks in their spaces"
ON public.tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = tasks.space_id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.status = 'approved'
  )
);

DROP POLICY IF EXISTS "Members can create tasks in their spaces" ON public.tasks;
CREATE POLICY "Members can create tasks in their spaces"
ON public.tasks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = tasks.space_id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.status = 'approved'
  )
);

DROP POLICY IF EXISTS "Creators, assignees, admins can update tasks" ON public.tasks;
CREATE POLICY "Creators, assignees, admins can update tasks"
ON public.tasks
FOR UPDATE
USING (
  created_by = (SELECT auth.uid() AS uid)
  OR assignee_id = (SELECT auth.uid() AS uid)
  OR EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = tasks.space_id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.role = ANY(ARRAY['owner','admin'])
      AND m.status = 'approved'
  )
);

DROP POLICY IF EXISTS "Creators or admins can delete tasks" ON public.tasks;
CREATE POLICY "Creators or admins can delete tasks"
ON public.tasks
FOR DELETE
USING (
  created_by = (SELECT auth.uid() AS uid)
  OR EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = tasks.space_id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.role = ANY(ARRAY['owner','admin'])
      AND m.status = 'approved'
  )
);

-- milestones
DROP POLICY IF EXISTS "Members can view milestones in their spaces" ON public.milestones;
CREATE POLICY "Members can view milestones in their spaces"
ON public.milestones
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = milestones.space_id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.status = 'approved'
  )
);

DROP POLICY IF EXISTS "Members can create milestones in their spaces" ON public.milestones;
CREATE POLICY "Members can create milestones in their spaces"
ON public.milestones
FOR INSERT
WITH CHECK (
  (created_by = (SELECT auth.uid() AS uid)) AND EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = milestones.space_id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.status = 'approved'
  )
);

DROP POLICY IF EXISTS "Creators or admins can update milestones" ON public.milestones;
CREATE POLICY "Creators or admins can update milestones"
ON public.milestones
FOR UPDATE
USING (
  created_by = (SELECT auth.uid() AS uid)
  OR EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = milestones.space_id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.role = ANY(ARRAY['owner','admin'])
      AND m.status = 'approved'
  )
);

DROP POLICY IF EXISTS "Creators or admins can delete milestones" ON public.milestones;
CREATE POLICY "Creators or admins can delete milestones"
ON public.milestones
FOR DELETE
USING (
  created_by = (SELECT auth.uid() AS uid)
  OR EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = milestones.space_id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.role = ANY(ARRAY['owner','admin'])
      AND m.status = 'approved'
  )
);

-- opportunities
DROP POLICY IF EXISTS "Users can create their own opportunities" ON public.opportunities;
CREATE POLICY "Users can create their own opportunities"
ON public.opportunities
FOR INSERT
WITH CHECK (((SELECT auth.uid() AS uid) IS NOT NULL) AND (created_by = (SELECT auth.uid() AS uid)));

DROP POLICY IF EXISTS "Creators or space admins can update opportunities" ON public.opportunities;
CREATE POLICY "Creators or space admins can update opportunities"
ON public.opportunities
FOR UPDATE
USING (
  created_by = (SELECT auth.uid() AS uid)
  OR EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = opportunities.space_id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.role = ANY(ARRAY['owner','admin'])
      AND m.status = 'approved'
  )
);

DROP POLICY IF EXISTS "Creators or space admins can delete opportunities" ON public.opportunities;
CREATE POLICY "Creators or space admins can delete opportunities"
ON public.opportunities
FOR DELETE
USING (
  created_by = (SELECT auth.uid() AS uid)
  OR EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = opportunities.space_id
      AND m.user_id = (SELECT auth.uid() AS uid)
      AND m.role = ANY(ARRAY['owner','admin'])
      AND m.status = 'approved'
  )
);