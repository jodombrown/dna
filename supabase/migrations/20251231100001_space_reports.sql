-- Create space_reports table for tracking reported collaboration spaces
-- This enables admin moderation capabilities for the COLLABORATE pillar

CREATE TABLE IF NOT EXISTS public.space_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES public.collaboration_spaces(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate_content', 'scam', 'impersonation', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add creator_id column for easier joins in admin queries
-- This is derived from collaboration_spaces.created_by but stored for convenience
ALTER TABLE public.space_reports
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create trigger to auto-populate creator_id from space
CREATE OR REPLACE FUNCTION public.set_space_report_creator_id()
RETURNS TRIGGER AS $$
BEGIN
  SELECT created_by INTO NEW.creator_id
  FROM public.collaboration_spaces
  WHERE id = NEW.space_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_set_space_report_creator_id ON public.space_reports;
CREATE TRIGGER trg_set_space_report_creator_id
BEFORE INSERT ON public.space_reports
FOR EACH ROW EXECUTE FUNCTION public.set_space_report_creator_id();

-- Enable RLS
ALTER TABLE public.space_reports ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_space_reports_space_id ON public.space_reports(space_id);
CREATE INDEX IF NOT EXISTS idx_space_reports_reporter_id ON public.space_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_space_reports_status ON public.space_reports(status);
CREATE INDEX IF NOT EXISTS idx_space_reports_created_at ON public.space_reports(created_at DESC);

-- RLS Policies

-- Users can create reports for spaces they can see
CREATE POLICY "Users can create space reports"
ON public.space_reports
FOR INSERT
WITH CHECK (
  reporter_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.collaboration_spaces cs
    WHERE cs.id = space_reports.space_id
    AND (
      cs.visibility = 'public'
      OR EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = cs.id
        AND m.user_id = (SELECT auth.uid())
        AND m.status = 'approved'
      )
    )
  )
);

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
ON public.space_reports
FOR SELECT
USING (reporter_id = (SELECT auth.uid()));

-- Admins can view all reports
CREATE POLICY "Admins can view all space reports"
ON public.space_reports
FOR SELECT
USING (is_admin_user((SELECT auth.uid())));

-- Admins can update reports (for moderation actions)
CREATE POLICY "Admins can update space reports"
ON public.space_reports
FOR UPDATE
USING (is_admin_user((SELECT auth.uid())));

-- Prevent deletion of reports (audit trail)
-- Only allow admins to delete if absolutely necessary
CREATE POLICY "Only admins can delete space reports"
ON public.space_reports
FOR DELETE
USING (is_admin_user((SELECT auth.uid())));

-- Prevent users from reporting the same space multiple times while pending
CREATE UNIQUE INDEX IF NOT EXISTS idx_space_reports_unique_pending
ON public.space_reports(space_id, reporter_id)
WHERE status = 'pending';

COMMENT ON TABLE public.space_reports IS 'Stores reports of collaboration spaces for moderation';
COMMENT ON COLUMN public.space_reports.reason IS 'Category of the report: spam, harassment, inappropriate_content, scam, impersonation, other';
COMMENT ON COLUMN public.space_reports.status IS 'Moderation status: pending (unreviewed), reviewed (under investigation), resolved (action taken), dismissed (no action)';
