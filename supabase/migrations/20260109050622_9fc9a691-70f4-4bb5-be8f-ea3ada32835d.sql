-- BATCH 2A: ALTER TABLES ONLY

-- ADD COLUMNS TO SPACES (skip if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spaces' AND column_name = 'template_id') THEN
    ALTER TABLE public.spaces ADD COLUMN template_id UUID REFERENCES public.space_templates(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spaces' AND column_name = 'privacy_level') THEN
    ALTER TABLE public.spaces ADD COLUMN privacy_level VARCHAR(20) DEFAULT 'public';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spaces' AND column_name = 'cover_image_url') THEN
    ALTER TABLE public.spaces ADD COLUMN cover_image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spaces' AND column_name = 'source_type') THEN
    ALTER TABLE public.spaces ADD COLUMN source_type VARCHAR(20);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spaces' AND column_name = 'source_id') THEN
    ALTER TABLE public.spaces ADD COLUMN source_id UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spaces' AND column_name = 'completion_summary') THEN
    ALTER TABLE public.spaces ADD COLUMN completion_summary JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spaces' AND column_name = 'last_activity_at') THEN
    ALTER TABLE public.spaces ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spaces' AND column_name = 'stall_threshold_days') THEN
    ALTER TABLE public.spaces ADD COLUMN stall_threshold_days INTEGER DEFAULT 14;
  END IF;
END $$;

-- ADD COLUMNS TO SPACE_MEMBERS (skip if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'space_members' AND column_name = 'id') THEN
    ALTER TABLE public.space_members ADD COLUMN id UUID DEFAULT gen_random_uuid();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'space_members' AND column_name = 'role_id') THEN
    ALTER TABLE public.space_members ADD COLUMN role_id UUID REFERENCES public.space_roles(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'space_members' AND column_name = 'status') THEN
    ALTER TABLE public.space_members ADD COLUMN status VARCHAR(20) DEFAULT 'active';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'space_members' AND column_name = 'invited_by') THEN
    ALTER TABLE public.space_members ADD COLUMN invited_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- ADD COLUMNS TO TASKS (skip if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'initiative_id') THEN
    ALTER TABLE public.tasks ADD COLUMN initiative_id UUID REFERENCES public.initiatives(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'milestone_id') THEN
    ALTER TABLE public.tasks ADD COLUMN milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'assigned_to') THEN
    ALTER TABLE public.tasks ADD COLUMN assigned_to UUID REFERENCES auth.users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'assigned_by') THEN
    ALTER TABLE public.tasks ADD COLUMN assigned_by UUID REFERENCES auth.users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'nudge_count') THEN
    ALTER TABLE public.tasks ADD COLUMN nudge_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'last_nudge_at') THEN
    ALTER TABLE public.tasks ADD COLUMN last_nudge_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'order_index') THEN
    ALTER TABLE public.tasks ADD COLUMN order_index INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completed_at') THEN
    ALTER TABLE public.tasks ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
END $$;