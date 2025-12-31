-- Create enum for contribution report status
CREATE TYPE contribution_report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- Create enum for contribution report reason
CREATE TYPE contribution_report_reason AS ENUM ('spam', 'inappropriate', 'misleading', 'scam', 'other');

-- Create contribution_reports table
CREATE TABLE IF NOT EXISTS public.contribution_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES public.contribution_needs(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason contribution_report_reason NOT NULL,
  details TEXT,
  status contribution_report_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create indexes for common queries
CREATE INDEX idx_contribution_reports_need_id ON public.contribution_reports(need_id);
CREATE INDEX idx_contribution_reports_reporter_id ON public.contribution_reports(reporter_id);
CREATE INDEX idx_contribution_reports_status ON public.contribution_reports(status);
CREATE INDEX idx_contribution_reports_created_at ON public.contribution_reports(created_at DESC);

-- Enable RLS
ALTER TABLE public.contribution_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT
-- Admins can view all reports
-- Reporters can view their own reports
CREATE POLICY "Admins can view all reports, users can view own reports"
  ON public.contribution_reports
  FOR SELECT
  USING (
    reporter_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = auth.uid()
      AND pa.status = 'active'
    )
  );

-- RLS Policy: INSERT
-- Any authenticated user can report a contribution
CREATE POLICY "Authenticated users can create reports"
  ON public.contribution_reports
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND reporter_id = auth.uid()
    -- Prevent reporting own needs
    AND NOT EXISTS (
      SELECT 1 FROM public.contribution_needs cn
      WHERE cn.id = need_id
      AND cn.created_by = auth.uid()
    )
  );

-- RLS Policy: UPDATE
-- Only admins can update reports
CREATE POLICY "Admins can update reports"
  ON public.contribution_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = auth.uid()
      AND pa.status = 'active'
    )
  );

-- RLS Policy: DELETE
-- Only admins can delete reports
CREATE POLICY "Admins can delete reports"
  ON public.contribution_reports
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = auth.uid()
      AND pa.status = 'active'
    )
  );

-- Function to log report events
CREATE OR REPLACE FUNCTION public.log_contribution_report_event()
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
      'contribution_reported',
      NEW.reporter_id,
      jsonb_build_object(
        'report_id', NEW.id,
        'need_id', NEW.need_id,
        'reason', NEW.reason
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.analytics_events (
      event_name,
      user_id,
      event_data
    ) VALUES (
      'contribution_report_status_changed',
      auth.uid(),
      jsonb_build_object(
        'report_id', NEW.id,
        'need_id', NEW.need_id,
        'from_status', OLD.status,
        'to_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for report event logging
CREATE TRIGGER log_contribution_report_events
  AFTER INSERT OR UPDATE ON public.contribution_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.log_contribution_report_event();

-- Add comment for documentation
COMMENT ON TABLE public.contribution_reports IS 'Stores reports submitted by users for contribution opportunities that violate guidelines';
