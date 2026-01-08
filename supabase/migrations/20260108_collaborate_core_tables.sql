-- Migration: 20260108_collaborate_core_tables.sql
-- DNA COLLABORATE Phase 1: Core Infrastructure

-- ============================================
-- SPACE TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS public.space_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'users',
  category VARCHAR(50) NOT NULL CHECK (category IN ('professional', 'community', 'investment', 'learning', 'advocacy')),
  default_roles JSONB DEFAULT '[]'::jsonb,
  default_initiatives JSONB DEFAULT '[]'::jsonb,
  suggested_milestones JSONB DEFAULT '[]'::jsonb,
  tier_availability VARCHAR[] DEFAULT ARRAY['free', 'pro', 'org'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ENHANCE EXISTING SPACES TABLE
-- ============================================
-- Add new columns to existing spaces table
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.space_templates(id);
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS privacy_level VARCHAR(20) DEFAULT 'public' CHECK (privacy_level IN ('public', 'private', 'invite_only'));
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) CHECK (source_type IN ('event', 'content', 'marketplace', 'organic'));
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS source_id UUID;
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS completion_summary JSONB;
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS stall_threshold_days INTEGER DEFAULT 14;
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS external_link TEXT;

-- Migrate visibility to privacy_level if needed
UPDATE public.spaces SET privacy_level = visibility WHERE privacy_level IS NULL AND visibility IS NOT NULL;

-- ============================================
-- SPACE ROLES
-- ============================================
CREATE TABLE IF NOT EXISTS public.space_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  required_skills TEXT[],
  permissions JSONB DEFAULT '{
    "can_edit_space": false,
    "can_invite_members": false,
    "can_create_initiatives": false,
    "can_assign_tasks": false,
    "can_send_nudges": false,
    "can_manage_roles": false
  }'::jsonb,
  is_lead BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ENHANCE SPACE MEMBERS TABLE
-- ============================================
-- Add new columns to existing space_members table
-- First add id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'space_members' AND column_name = 'id'
  ) THEN
    ALTER TABLE public.space_members ADD COLUMN id UUID DEFAULT gen_random_uuid();
    -- Make it unique
    CREATE UNIQUE INDEX IF NOT EXISTS idx_space_members_id ON public.space_members(id);
  END IF;
END $$;

ALTER TABLE public.space_members ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.space_roles(id);
ALTER TABLE public.space_members ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'invited', 'removed'));
ALTER TABLE public.space_members ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id);

-- Rename joined_at to match convention if needed
-- Already exists as joined_at in original schema

-- ============================================
-- INITIATIVES
-- ============================================
CREATE TABLE IF NOT EXISTS public.initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'abandoned')),
  target_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_metrics JSONB,
  order_index INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- MILESTONES
-- ============================================
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID REFERENCES public.initiatives(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  target_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed')),
  completion_date TIMESTAMPTZ,
  celebration_shared BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TASKS (Collaborate-specific tasks)
-- ============================================
CREATE TABLE IF NOT EXISTS public.collaborate_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  initiative_id UUID REFERENCES public.initiatives(id) ON DELETE SET NULL,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),
  nudge_count INTEGER DEFAULT 0,
  last_nudge_at TIMESTAMPTZ,
  order_index INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- NUDGES
-- ============================================
CREATE TABLE IF NOT EXISTS public.collaborate_nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.collaborate_tasks(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sent_by UUID REFERENCES auth.users(id),
  type VARCHAR(20) DEFAULT 'automated' CHECK (type IN ('automated', 'manual', 'escalation')),
  tone VARCHAR(20) DEFAULT 'gentle' CHECK (tone IN ('gentle', 'checkin', 'urgent')),
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SPACE ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS public.space_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  action_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_space_templates_category ON public.space_templates(category);
CREATE INDEX IF NOT EXISTS idx_space_templates_active ON public.space_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_spaces_template ON public.spaces(template_id);
CREATE INDEX IF NOT EXISTS idx_spaces_privacy ON public.spaces(privacy_level);
CREATE INDEX IF NOT EXISTS idx_spaces_last_activity ON public.spaces(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_space_roles_space ON public.space_roles(space_id);
CREATE INDEX IF NOT EXISTS idx_space_members_role ON public.space_members(role_id);
CREATE INDEX IF NOT EXISTS idx_space_members_status ON public.space_members(status);
CREATE INDEX IF NOT EXISTS idx_initiatives_space ON public.initiatives(space_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_status ON public.initiatives(status);
CREATE INDEX IF NOT EXISTS idx_initiatives_created_by ON public.initiatives(created_by);
CREATE INDEX IF NOT EXISTS idx_milestones_initiative ON public.milestones(initiative_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.milestones(status);
CREATE INDEX IF NOT EXISTS idx_collaborate_tasks_space ON public.collaborate_tasks(space_id);
CREATE INDEX IF NOT EXISTS idx_collaborate_tasks_initiative ON public.collaborate_tasks(initiative_id);
CREATE INDEX IF NOT EXISTS idx_collaborate_tasks_milestone ON public.collaborate_tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_collaborate_tasks_assigned ON public.collaborate_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_collaborate_tasks_status ON public.collaborate_tasks(status);
CREATE INDEX IF NOT EXISTS idx_collaborate_tasks_due_date ON public.collaborate_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_collaborate_nudges_target ON public.collaborate_nudges(target_user_id);
CREATE INDEX IF NOT EXISTS idx_collaborate_nudges_space ON public.collaborate_nudges(space_id);
CREATE INDEX IF NOT EXISTS idx_collaborate_nudges_task ON public.collaborate_nudges(task_id);
CREATE INDEX IF NOT EXISTS idx_activity_space ON public.space_activity_log(space_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.space_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON public.space_activity_log(action_type);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Space Templates RLS (public read)
ALTER TABLE public.space_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are publicly readable"
  ON public.space_templates FOR SELECT
  USING (is_active = true);

-- Space Roles RLS
ALTER TABLE public.space_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles visible to space members"
  ON public.space_roles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.space_members sm
    WHERE sm.space_id = space_roles.space_id AND sm.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.spaces s
    WHERE s.id = space_roles.space_id AND s.visibility = 'public'
  ));

CREATE POLICY "Space leads can manage roles"
  ON public.space_roles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.spaces s
    WHERE s.id = space_roles.space_id AND s.created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.space_members sm
    JOIN public.space_roles sr ON sm.role_id = sr.id
    WHERE sm.space_id = space_roles.space_id
    AND sm.user_id = auth.uid()
    AND sr.permissions->>'can_manage_roles' = 'true'
  ));

-- Initiatives RLS
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Initiatives visible to space members"
  ON public.initiatives FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.space_members sm
    WHERE sm.space_id = initiatives.space_id AND sm.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.spaces s
    WHERE s.id = initiatives.space_id AND s.visibility = 'public'
  ));

CREATE POLICY "Space members can create initiatives"
  ON public.initiatives FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.space_members sm
    WHERE sm.space_id = initiatives.space_id AND sm.user_id = auth.uid()
  ));

CREATE POLICY "Initiative creators and leads can update"
  ON public.initiatives FOR UPDATE
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.space_members sm
    JOIN public.space_roles sr ON sm.role_id = sr.id
    WHERE sm.space_id = initiatives.space_id
    AND sm.user_id = auth.uid()
    AND sr.is_lead = true
  ));

CREATE POLICY "Initiative creators and leads can delete"
  ON public.initiatives FOR DELETE
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.space_members sm
    JOIN public.space_roles sr ON sm.role_id = sr.id
    WHERE sm.space_id = initiatives.space_id
    AND sm.user_id = auth.uid()
    AND sr.is_lead = true
  ));

-- Milestones RLS
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Milestones visible to space members"
  ON public.milestones FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.initiatives i
    JOIN public.space_members sm ON sm.space_id = i.space_id
    WHERE i.id = milestones.initiative_id AND sm.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.initiatives i
    JOIN public.spaces s ON s.id = i.space_id
    WHERE i.id = milestones.initiative_id AND s.visibility = 'public'
  ));

CREATE POLICY "Space members can manage milestones"
  ON public.milestones FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.initiatives i
    JOIN public.space_members sm ON sm.space_id = i.space_id
    WHERE i.id = milestones.initiative_id AND sm.user_id = auth.uid()
  ));

-- Collaborate Tasks RLS
ALTER TABLE public.collaborate_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks visible to space members"
  ON public.collaborate_tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.space_members sm
    WHERE sm.space_id = collaborate_tasks.space_id AND sm.user_id = auth.uid()
  ));

CREATE POLICY "Space members can create tasks"
  ON public.collaborate_tasks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.space_members sm
    WHERE sm.space_id = collaborate_tasks.space_id AND sm.user_id = auth.uid()
  ));

CREATE POLICY "Task assignees and creators can update"
  ON public.collaborate_tasks FOR UPDATE
  USING (
    created_by = auth.uid()
    OR assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.space_members sm
      JOIN public.space_roles sr ON sm.role_id = sr.id
      WHERE sm.space_id = collaborate_tasks.space_id
      AND sm.user_id = auth.uid()
      AND sr.permissions->>'can_assign_tasks' = 'true'
    )
  );

CREATE POLICY "Task creators and leads can delete"
  ON public.collaborate_tasks FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.space_members sm
      JOIN public.space_roles sr ON sm.role_id = sr.id
      WHERE sm.space_id = collaborate_tasks.space_id
      AND sm.user_id = auth.uid()
      AND sr.is_lead = true
    )
  );

-- Collaborate Nudges RLS
ALTER TABLE public.collaborate_nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see nudges they sent or received"
  ON public.collaborate_nudges FOR SELECT
  USING (target_user_id = auth.uid() OR sent_by = auth.uid());

CREATE POLICY "Authorized users can send nudges"
  ON public.collaborate_nudges FOR INSERT
  WITH CHECK (
    sent_by = auth.uid() AND (
      type = 'automated' OR EXISTS (
        SELECT 1 FROM public.space_members sm
        JOIN public.space_roles sr ON sm.role_id = sr.id
        WHERE sm.space_id = collaborate_nudges.space_id
        AND sm.user_id = auth.uid()
        AND sr.permissions->>'can_send_nudges' = 'true'
      )
    )
  );

CREATE POLICY "Users can acknowledge their nudges"
  ON public.collaborate_nudges FOR UPDATE
  USING (target_user_id = auth.uid())
  WITH CHECK (target_user_id = auth.uid());

-- Activity Log RLS
ALTER TABLE public.space_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity visible to space members"
  ON public.space_activity_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.space_members sm
    WHERE sm.space_id = space_activity_log.space_id AND sm.user_id = auth.uid()
  ));

CREATE POLICY "System can insert activity"
  ON public.space_activity_log FOR INSERT
  WITH CHECK (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update last_activity_at on spaces
CREATE OR REPLACE FUNCTION update_space_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.spaces
  SET last_activity_at = now(), updated_at = now()
  WHERE id = NEW.space_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for activity tracking
DROP TRIGGER IF EXISTS collaborate_task_activity_trigger ON public.collaborate_tasks;
CREATE TRIGGER collaborate_task_activity_trigger
  AFTER INSERT OR UPDATE ON public.collaborate_tasks
  FOR EACH ROW EXECUTE FUNCTION update_space_activity();

DROP TRIGGER IF EXISTS initiative_activity_trigger ON public.initiatives;
CREATE TRIGGER initiative_activity_trigger
  AFTER INSERT OR UPDATE ON public.initiatives
  FOR EACH ROW EXECUTE FUNCTION update_space_activity();

-- Auto-add creator as member (only if not already a member)
CREATE OR REPLACE FUNCTION add_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if creator is already a member
  IF NOT EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_id = NEW.id AND user_id = NEW.created_by
  ) THEN
    INSERT INTO public.space_members (space_id, user_id, role, status)
    VALUES (NEW.id, NEW.created_by, 'lead', 'active');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS space_creator_member_trigger ON public.spaces;
CREATE TRIGGER space_creator_member_trigger
  AFTER INSERT ON public.spaces
  FOR EACH ROW EXECUTE FUNCTION add_creator_as_member();

-- Function to increment nudge count
CREATE OR REPLACE FUNCTION increment_nudge_count(task_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT nudge_count INTO current_count
  FROM public.collaborate_tasks
  WHERE id = task_uuid;

  RETURN COALESCE(current_count, 0) + 1;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS initiatives_updated_at ON public.initiatives;
CREATE TRIGGER initiatives_updated_at
  BEFORE UPDATE ON public.initiatives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS milestones_updated_at ON public.milestones;
CREATE TRIGGER milestones_updated_at
  BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS collaborate_tasks_updated_at ON public.collaborate_tasks;
CREATE TRIGGER collaborate_tasks_updated_at
  BEFORE UPDATE ON public.collaborate_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS space_templates_updated_at ON public.space_templates;
CREATE TRIGGER space_templates_updated_at
  BEFORE UPDATE ON public.space_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
