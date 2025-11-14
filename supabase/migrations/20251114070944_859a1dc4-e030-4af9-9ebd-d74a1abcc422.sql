-- Create task status enum
CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'done');

-- Create update type enum
CREATE TYPE space_update_type AS ENUM ('manual_update', 'milestone', 'auto_task_event');

-- Create space_tasks table
CREATE TABLE public.space_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status task_status NOT NULL DEFAULT 'open',
  due_date DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create space_updates table
CREATE TABLE public.space_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type space_update_type NOT NULL DEFAULT 'manual_update',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_space_tasks_space_id ON public.space_tasks(space_id);
CREATE INDEX idx_space_tasks_assignee_id ON public.space_tasks(assignee_id);
CREATE INDEX idx_space_tasks_status ON public.space_tasks(status);
CREATE INDEX idx_space_tasks_due_date ON public.space_tasks(due_date);
CREATE INDEX idx_space_updates_space_id ON public.space_updates(space_id);
CREATE INDEX idx_space_updates_created_at ON public.space_updates(created_at DESC);

-- Enable RLS
ALTER TABLE public.space_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for space_tasks

-- Members can read tasks in their spaces
CREATE POLICY "Members can view space tasks"
ON public.space_tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_tasks.space_id
    AND space_members.user_id = auth.uid()
  )
);

-- Members can create tasks in their spaces
CREATE POLICY "Members can create tasks"
ON public.space_tasks
FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_tasks.space_id
    AND space_members.user_id = auth.uid()
  )
);

-- Leads, creators, and assignees can update tasks
CREATE POLICY "Authorized users can update tasks"
ON public.space_tasks
FOR UPDATE
USING (
  -- User is a lead of the space
  EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_tasks.space_id
    AND space_members.user_id = auth.uid()
    AND space_members.role = 'lead'
  )
  OR auth.uid() = created_by  -- Creator can edit
  OR auth.uid() = assignee_id  -- Assignee can edit (at least status)
);

-- Leads and creators can delete tasks
CREATE POLICY "Leads and creators can delete tasks"
ON public.space_tasks
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_tasks.space_id
    AND space_members.user_id = auth.uid()
    AND space_members.role = 'lead'
  )
  OR auth.uid() = created_by
);

-- RLS Policies for space_updates

-- Members can read updates in their spaces
CREATE POLICY "Members can view space updates"
ON public.space_updates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_updates.space_id
    AND space_members.user_id = auth.uid()
  )
);

-- Members can create updates in their spaces
CREATE POLICY "Members can create updates"
ON public.space_updates
FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_updates.space_id
    AND space_members.user_id = auth.uid()
  )
);

-- Users can delete their own updates, leads can delete any
CREATE POLICY "Users can delete own updates, leads can delete any"
ON public.space_updates
FOR DELETE
USING (
  auth.uid() = created_by
  OR EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_updates.space_id
    AND space_members.user_id = auth.uid()
    AND space_members.role = 'lead'
  )
);

-- Update trigger for space_tasks
CREATE TRIGGER space_tasks_updated_at
BEFORE UPDATE ON public.space_tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();