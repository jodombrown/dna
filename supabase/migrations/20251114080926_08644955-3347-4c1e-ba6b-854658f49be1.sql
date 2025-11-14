-- Create enum types for contribution needs
CREATE TYPE contribution_need_type AS ENUM ('funding', 'skills', 'time', 'access', 'resources');
CREATE TYPE contribution_need_status AS ENUM ('open', 'in_progress', 'fulfilled', 'closed');
CREATE TYPE contribution_need_priority AS ENUM ('normal', 'high');

-- Create contribution_needs table
CREATE TABLE public.contribution_needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  type contribution_need_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status contribution_need_status NOT NULL DEFAULT 'open',
  priority contribution_need_priority NOT NULL DEFAULT 'normal',
  focus_areas TEXT[],
  region TEXT,
  target_amount NUMERIC,
  currency TEXT,
  time_commitment TEXT,
  duration TEXT,
  needed_by DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for common queries
CREATE INDEX idx_contribution_needs_space_id ON public.contribution_needs(space_id);
CREATE INDEX idx_contribution_needs_status ON public.contribution_needs(status);
CREATE INDEX idx_contribution_needs_type ON public.contribution_needs(type);
CREATE INDEX idx_contribution_needs_created_at ON public.contribution_needs(created_at DESC);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_contribution_needs_updated_at
  BEFORE UPDATE ON public.contribution_needs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_spaces_updated_at();

-- Enable RLS
ALTER TABLE public.contribution_needs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT
-- Users can read needs for public spaces or spaces they're members of
CREATE POLICY "Users can view needs for accessible spaces"
  ON public.contribution_needs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.spaces s
      WHERE s.id = contribution_needs.space_id
      AND (
        s.visibility = 'public'
        OR EXISTS (
          SELECT 1 FROM public.space_members sm
          WHERE sm.space_id = s.id
          AND sm.user_id = auth.uid()
        )
      )
    )
  );

-- RLS Policy: INSERT
-- Only space leads can create needs
CREATE POLICY "Space leads can create needs"
  ON public.contribution_needs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = contribution_needs.space_id
      AND sm.user_id = auth.uid()
      AND sm.role = 'lead'
    )
  );

-- RLS Policy: UPDATE
-- Only space leads can update needs
CREATE POLICY "Space leads can update needs"
  ON public.contribution_needs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = contribution_needs.space_id
      AND sm.user_id = auth.uid()
      AND sm.role = 'lead'
    )
  );

-- RLS Policy: DELETE
-- Only space leads can delete needs
CREATE POLICY "Space leads can delete needs"
  ON public.contribution_needs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = contribution_needs.space_id
      AND sm.user_id = auth.uid()
      AND sm.role = 'lead'
    )
  );

-- Function to log need events
CREATE OR REPLACE FUNCTION public.log_need_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.analytics_events (
      event_name,
      user_id,
      event_data
    ) VALUES (
      'need_created',
      NEW.created_by,
      jsonb_build_object(
        'need_id', NEW.id,
        'space_id', NEW.space_id,
        'type', NEW.type,
        'priority', NEW.priority
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.analytics_events (
      event_name,
      user_id,
      event_data
    ) VALUES (
      'need_status_changed',
      auth.uid(),
      jsonb_build_object(
        'need_id', NEW.id,
        'space_id', NEW.space_id,
        'from_status', OLD.status,
        'to_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for event logging
CREATE TRIGGER log_contribution_need_events
  AFTER INSERT OR UPDATE ON public.contribution_needs
  FOR EACH ROW
  EXECUTE FUNCTION public.log_need_event();