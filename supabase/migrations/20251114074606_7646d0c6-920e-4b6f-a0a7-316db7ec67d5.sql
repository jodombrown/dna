-- M5: Advanced Project Tools - Attachments, Dependencies, and supporting structures

-- Create enum for attachment types
CREATE TYPE attachment_type AS ENUM ('space', 'task', 'update');

-- Create space_attachments table for file tracking
CREATE TABLE public.space_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  attached_to_type attachment_type NOT NULL,
  attached_to_id uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer NOT NULL,
  file_type text,
  uploaded_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_space_attachments_space_id ON public.space_attachments(space_id);
CREATE INDEX idx_space_attachments_attached_to ON public.space_attachments(attached_to_type, attached_to_id);
CREATE INDEX idx_space_attachments_uploaded_by ON public.space_attachments(uploaded_by);

-- Enable RLS on space_attachments
ALTER TABLE public.space_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for space_attachments
-- Members can view attachments in their spaces
CREATE POLICY "Members can view space attachments"
ON public.space_attachments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_attachments.space_id
    AND space_members.user_id = (select auth.uid())
  )
);

-- Members can upload attachments
CREATE POLICY "Members can upload attachments"
ON public.space_attachments
FOR INSERT
WITH CHECK (
  uploaded_by = (select auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_attachments.space_id
    AND space_members.user_id = (select auth.uid())
  )
);

-- Leads and uploaders can delete attachments
CREATE POLICY "Authorized users can delete attachments"
ON public.space_attachments
FOR DELETE
USING (
  uploaded_by = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = space_attachments.space_id
    AND space_members.user_id = (select auth.uid())
    AND space_members.role = 'lead'
  )
);

-- Create space_task_dependencies table for task blocking
CREATE TABLE public.space_task_dependencies (
  task_id uuid NOT NULL REFERENCES public.space_tasks(id) ON DELETE CASCADE,
  depends_on_task_id uuid NOT NULL REFERENCES public.space_tasks(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, depends_on_task_id),
  CONSTRAINT different_tasks CHECK (task_id != depends_on_task_id)
);

-- Create index for dependencies
CREATE INDEX idx_task_dependencies_task ON public.space_task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON public.space_task_dependencies(depends_on_task_id);

-- Enable RLS on space_task_dependencies
ALTER TABLE public.space_task_dependencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for space_task_dependencies
-- Members can view dependencies
CREATE POLICY "Members can view task dependencies"
ON public.space_task_dependencies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.space_tasks t
    JOIN public.space_members sm ON sm.space_id = t.space_id
    WHERE t.id = space_task_dependencies.task_id
    AND sm.user_id = (select auth.uid())
  )
);

-- Authorized users can create dependencies
CREATE POLICY "Authorized users can create dependencies"
ON public.space_task_dependencies
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.space_tasks t
    JOIN public.space_members sm ON sm.space_id = t.space_id
    WHERE t.id = space_task_dependencies.task_id
    AND sm.user_id = (select auth.uid())
    AND (
      sm.role = 'lead'
      OR t.created_by = (select auth.uid())
      OR t.assignee_id = (select auth.uid())
    )
  )
  -- Ensure both tasks are in the same space
  AND EXISTS (
    SELECT 1 FROM public.space_tasks t1, public.space_tasks t2
    WHERE t1.id = space_task_dependencies.task_id
    AND t2.id = space_task_dependencies.depends_on_task_id
    AND t1.space_id = t2.space_id
  )
);

-- Authorized users can delete dependencies
CREATE POLICY "Authorized users can delete dependencies"
ON public.space_task_dependencies
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.space_tasks t
    JOIN public.space_members sm ON sm.space_id = t.space_id
    WHERE t.id = space_task_dependencies.task_id
    AND sm.user_id = (select auth.uid())
    AND (
      sm.role = 'lead'
      OR t.created_by = (select auth.uid())
      OR t.assignee_id = (select auth.uid())
    )
  )
);

-- Create storage bucket for space attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('space-attachments', 'space-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for space attachments
CREATE POLICY "Members can view space attachment files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'space-attachments'
  AND EXISTS (
    SELECT 1 FROM public.space_attachments sa
    JOIN public.space_members sm ON sm.space_id = sa.space_id
    WHERE sa.file_url = storage.objects.name
    AND sm.user_id = (select auth.uid())
  )
);

CREATE POLICY "Members can upload space attachment files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'space-attachments'
  AND (select auth.uid()) IS NOT NULL
);

CREATE POLICY "Authorized users can delete space attachment files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'space-attachments'
  AND (
    -- User uploaded the file
    owner = (select auth.uid())
    OR
    -- User is a lead in the space
    EXISTS (
      SELECT 1 FROM public.space_attachments sa
      JOIN public.space_members sm ON sm.space_id = sa.space_id
      WHERE sa.file_url = storage.objects.name
      AND sm.user_id = (select auth.uid())
      AND sm.role = 'lead'
    )
  )
);