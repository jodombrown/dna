-- Fix tasks policies: use created_by instead of creator_id
DROP POLICY IF EXISTS "Creators, assignees, admins can update tasks" ON public.tasks;
CREATE POLICY "Creators, assignees, admins can update tasks"
ON public.tasks
FOR UPDATE
USING (
  created_by = (SELECT auth.uid())
  OR assignee_id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = tasks.space_id
      AND m.user_id = (SELECT auth.uid())
      AND m.role = ANY(ARRAY['owner','admin'])
      AND m.status = 'approved'
  )
);

DROP POLICY IF EXISTS "Creators or admins can delete tasks" ON public.tasks;
CREATE POLICY "Creators or admins can delete tasks"
ON public.tasks
FOR DELETE
USING (
  created_by = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = tasks.space_id
      AND m.user_id = (SELECT auth.uid())
      AND m.role = ANY(ARRAY['owner','admin'])
      AND m.status = 'approved'
  )
);