-- FIX: Add space_id to old initiatives table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'initiatives' AND column_name = 'space_id') THEN
    ALTER TABLE public.initiatives ADD COLUMN space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'initiatives' AND column_name = 'created_by') THEN
    ALTER TABLE public.initiatives ADD COLUMN created_by UUID REFERENCES auth.users(id);
    -- Copy from creator_id if it exists
    UPDATE public.initiatives SET created_by = creator_id WHERE creator_id IS NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'initiatives' AND column_name = 'status') THEN
    ALTER TABLE public.initiatives ADD COLUMN status VARCHAR(20) DEFAULT 'planning';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'initiatives' AND column_name = 'target_date') THEN
    ALTER TABLE public.initiatives ADD COLUMN target_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'initiatives' AND column_name = 'started_at') THEN
    ALTER TABLE public.initiatives ADD COLUMN started_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'initiatives' AND column_name = 'completed_at') THEN
    ALTER TABLE public.initiatives ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'initiatives' AND column_name = 'completion_metrics') THEN
    ALTER TABLE public.initiatives ADD COLUMN completion_metrics JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'initiatives' AND column_name = 'order_index') THEN
    ALTER TABLE public.initiatives ADD COLUMN order_index INTEGER DEFAULT 0;
  END IF;
END $$;

-- FIX: Add initiative_id to milestones if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'milestones' AND column_name = 'initiative_id') THEN
    ALTER TABLE public.milestones ADD COLUMN initiative_id UUID REFERENCES public.initiatives(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'milestones' AND column_name = 'target_date') THEN
    ALTER TABLE public.milestones ADD COLUMN target_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'milestones' AND column_name = 'completion_date') THEN
    ALTER TABLE public.milestones ADD COLUMN completion_date TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'milestones' AND column_name = 'celebration_shared') THEN
    ALTER TABLE public.milestones ADD COLUMN celebration_shared BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'milestones' AND column_name = 'order_index') THEN
    ALTER TABLE public.milestones ADD COLUMN order_index INTEGER DEFAULT 0;
  END IF;
END $$;