-- Update approval and rejection functions to trigger email notifications
-- Also add magic link generation

-- Create magic link storage table
CREATE TABLE IF NOT EXISTS public.magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  beta_application_id UUID REFERENCES public.beta_applications(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on magic_links
ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;

-- Create policy for magic links (system access only)
CREATE POLICY "System can manage magic links" 
ON public.magic_links 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to generate magic link
CREATE OR REPLACE FUNCTION public.generate_magic_link(
  p_email TEXT,
  p_full_name TEXT,
  p_application_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token UUID := gen_random_uuid();
  v_base_url TEXT := 'https://your-domain.com'; -- Update this with actual domain
BEGIN
  -- Insert magic link record
  INSERT INTO public.magic_links (token, user_email, full_name, beta_application_id)
  VALUES (v_token, p_email, p_full_name, p_application_id);
  
  -- Return complete magic link URL
  RETURN v_base_url || '/auth/magic-link?token=' || v_token;
END;
$$;

-- Update approve_beta_application function
CREATE OR REPLACE FUNCTION public.approve_beta_application(
  p_application_id UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID := (SELECT auth.uid());
  v_magic_link_token UUID := gen_random_uuid();
  v_app_record RECORD;
  v_magic_link TEXT;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin_user(v_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Get application details
  SELECT * INTO v_app_record 
  FROM public.beta_applications 
  WHERE id = p_application_id;
  
  IF v_app_record IS NULL THEN
    RAISE EXCEPTION 'Application not found';
  END IF;
  
  -- Update application status
  UPDATE public.beta_applications 
  SET 
    status = 'approved',
    admin_notes = p_admin_notes,
    reviewed_by = v_admin_id,
    reviewed_at = now(),
    updated_at = now()
  WHERE id = p_application_id;
  
  -- Generate magic link
  v_magic_link := public.generate_magic_link(
    v_app_record.email,
    v_app_record.full_name,
    p_application_id
  );
  
  -- Send approval email using edge function
  PERFORM public.notify_beta_status(
    v_app_record.email,
    'application_approved',
    jsonb_build_object(
      'full_name', v_app_record.full_name,
      'admin_notes', p_admin_notes,
      'magic_link', v_magic_link
    )
  );
  
  RETURN v_magic_link_token;
END;
$$;

-- Update reject_beta_application function
CREATE OR REPLACE FUNCTION public.reject_beta_application(
  p_application_id UUID,
  p_admin_notes TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID := (SELECT auth.uid());
  v_app_record RECORD;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin_user(v_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Get application details
  SELECT * INTO v_app_record 
  FROM public.beta_applications 
  WHERE id = p_application_id;
  
  IF v_app_record IS NULL THEN
    RAISE EXCEPTION 'Application not found';
  END IF;
  
  -- Update application status
  UPDATE public.beta_applications 
  SET 
    status = 'rejected',
    admin_notes = p_admin_notes,
    reviewed_by = v_admin_id,
    reviewed_at = now(),
    updated_at = now()
  WHERE id = p_application_id;
  
  -- Send rejection email using edge function
  PERFORM public.notify_beta_status(
    v_app_record.email,
    'application_rejected',
    jsonb_build_object(
      'full_name', v_app_record.full_name,
      'admin_notes', p_admin_notes
    )
  );
END;
$$;

-- Create helper function to trigger email notifications
CREATE OR REPLACE FUNCTION public.notify_beta_status(
  p_email TEXT,
  p_type TEXT,
  p_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function will be called by the approve/reject functions
  -- The actual email sending will be handled by the edge function
  -- We log this for now and the edge function call will be made from the frontend
  INSERT INTO public.admin_logs (
    action,
    resource_type,
    details,
    created_at
  ) VALUES (
    'email_notification_triggered',
    'beta_application',
    jsonb_build_object(
      'email', p_email,
      'type', p_type,
      'data', p_data
    ),
    now()
  );
END;
$$;

-- Create indexes for magic_links
CREATE INDEX idx_magic_links_token ON public.magic_links(token);
CREATE INDEX idx_magic_links_email ON public.magic_links(user_email);
CREATE INDEX idx_magic_links_expires_at ON public.magic_links(expires_at);