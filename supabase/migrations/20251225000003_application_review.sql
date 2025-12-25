-- Add application review workflow
-- Feature 2: Opportunities (70% → 100%)

-- 1. Add review fields to applications table if not exist
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id);

-- 2. Create index for efficient lookups by opportunity owner
CREATE INDEX IF NOT EXISTS idx_applications_opportunity_id
  ON public.applications(opportunity_id);

-- 3. Create RPC function to update application status (for opportunity owners)
CREATE OR REPLACE FUNCTION public.update_application_status(
  p_application_id UUID,
  p_status TEXT,
  p_feedback TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_opportunity_owner UUID;
BEGIN
  -- Get the opportunity owner for this application
  SELECT o.created_by INTO v_opportunity_owner
  FROM public.applications a
  JOIN public.opportunities o ON a.opportunity_id = o.id
  WHERE a.id = p_application_id;

  -- Check if current user is the opportunity owner
  IF v_opportunity_owner IS NULL OR v_opportunity_owner != auth.uid() THEN
    RAISE EXCEPTION 'You do not have permission to update this application';
  END IF;

  -- Update the application
  UPDATE public.applications
  SET
    status = p_status,
    feedback = COALESCE(p_feedback, feedback),
    reviewed_at = now(),
    reviewed_by = auth.uid()
  WHERE id = p_application_id;

  -- Create notification for the applicant
  INSERT INTO public.notifications (user_id, type, title, message, data)
  SELECT
    a.user_id,
    'application_status',
    CASE p_status
      WHEN 'accepted' THEN 'Application Accepted!'
      WHEN 'rejected' THEN 'Application Update'
      WHEN 'reviewing' THEN 'Application Under Review'
      ELSE 'Application Update'
    END,
    CASE p_status
      WHEN 'accepted' THEN 'Congratulations! Your application has been accepted.'
      WHEN 'rejected' THEN 'Your application status has been updated.'
      WHEN 'reviewing' THEN 'Your application is now under review.'
      ELSE 'Your application status has been updated to: ' || p_status
    END,
    jsonb_build_object(
      'application_id', p_application_id,
      'opportunity_id', a.opportunity_id,
      'status', p_status
    )
  FROM public.applications a
  WHERE a.id = p_application_id;
END;
$$;

-- 4. Create RPC function to get received applications for opportunity owners
CREATE OR REPLACE FUNCTION public.get_received_applications(
  p_opportunity_id UUID DEFAULT NULL
)
RETURNS TABLE (
  application_id UUID,
  applicant_id UUID,
  applicant_name TEXT,
  applicant_avatar TEXT,
  applicant_headline TEXT,
  opportunity_id UUID,
  opportunity_title TEXT,
  status TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  applied_at TIMESTAMPTZ,
  feedback TEXT,
  reviewed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id as application_id,
    a.user_id as applicant_id,
    p.full_name as applicant_name,
    p.avatar_url as applicant_avatar,
    p.headline as applicant_headline,
    o.id as opportunity_id,
    o.title as opportunity_title,
    a.status,
    a.cover_letter,
    a.resume_url,
    a.applied_at,
    a.feedback,
    a.reviewed_at
  FROM public.applications a
  JOIN public.opportunities o ON a.opportunity_id = o.id
  JOIN public.profiles p ON a.user_id = p.id
  WHERE o.created_by = auth.uid()
  AND (p_opportunity_id IS NULL OR a.opportunity_id = p_opportunity_id)
  ORDER BY a.applied_at DESC;
END;
$$;

-- 5. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_application_status(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_received_applications(UUID) TO authenticated;
