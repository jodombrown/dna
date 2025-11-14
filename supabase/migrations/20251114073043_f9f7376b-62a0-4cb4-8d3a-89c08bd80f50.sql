-- Fix RLS performance issues for space_tasks and space_updates
-- Replace auth.uid() with (select auth.uid()) to cache the value

-- Drop existing policies for space_tasks
DROP POLICY IF EXISTS "Members can view space tasks" ON public.space_tasks;
DROP POLICY IF EXISTS "Members can create tasks" ON public.space_tasks;
DROP POLICY IF EXISTS "Authorized users can update tasks" ON public.space_tasks;
DROP POLICY IF EXISTS "Leads and creators can delete tasks" ON public.space_tasks;

-- Recreate space_tasks policies with optimized auth calls
CREATE POLICY "Members can view space tasks"
ON public.space_tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_tasks.space_id
    AND space_members.user_id = (select auth.uid())
  )
);

CREATE POLICY "Members can create tasks"
ON public.space_tasks
FOR INSERT
WITH CHECK (
  created_by = (select auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_tasks.space_id
    AND space_members.user_id = (select auth.uid())
  )
);

CREATE POLICY "Authorized users can update tasks"
ON public.space_tasks
FOR UPDATE
USING (
  -- Leads can update any task in their space
  EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_tasks.space_id
    AND space_members.user_id = (select auth.uid())
    AND space_members.role = 'lead'
  )
  OR
  -- Task creators can update their tasks
  created_by = (select auth.uid())
  OR
  -- Assignees can update task status
  (
    assignee_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.space_members
      WHERE space_members.space_id = space_tasks.space_id
      AND space_members.user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "Leads and creators can delete tasks"
ON public.space_tasks
FOR DELETE
USING (
  -- Leads can delete tasks
  EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_tasks.space_id
    AND space_members.user_id = (select auth.uid())
    AND space_members.role = 'lead'
  )
  OR
  -- Creators can delete their own tasks
  created_by = (select auth.uid())
);

-- Drop existing policies for space_updates
DROP POLICY IF EXISTS "Members can view space updates" ON public.space_updates;
DROP POLICY IF EXISTS "Members can create updates" ON public.space_updates;
DROP POLICY IF EXISTS "Users can delete own updates, leads can delete any" ON public.space_updates;

-- Recreate space_updates policies with optimized auth calls
CREATE POLICY "Members can view space updates"
ON public.space_updates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_updates.space_id
    AND space_members.user_id = (select auth.uid())
  )
);

CREATE POLICY "Members can create updates"
ON public.space_updates
FOR INSERT
WITH CHECK (
  created_by = (select auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_updates.space_id
    AND space_members.user_id = (select auth.uid())
  )
);

CREATE POLICY "Users can delete own updates, leads can delete any"
ON public.space_updates
FOR DELETE
USING (
  -- Users can delete their own updates
  created_by = (select auth.uid())
  OR
  -- Leads can delete any update in their space
  EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_updates.space_id
    AND space_members.user_id = (select auth.uid())
    AND space_members.role = 'lead'
  )
);