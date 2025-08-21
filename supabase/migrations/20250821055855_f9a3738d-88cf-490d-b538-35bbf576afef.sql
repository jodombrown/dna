-- Phase 1: Create beta_applications table and related functions
-- This will store applications from waitlist members who want to join the beta

-- Create beta_applications table
CREATE TABLE public.beta_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waitlist_signup_id UUID REFERENCES public.waitlist_signups(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  motivation TEXT NOT NULL,
  impact_area TEXT,
  location TEXT,
  linkedin_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  magic_link_sent_at TIMESTAMPTZ,
  profile_created_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beta_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for beta_applications
CREATE POLICY "Admins can view all beta applications" 
ON public.beta_applications 
FOR SELECT 
USING (public.is_admin_user((SELECT auth.uid())));

CREATE POLICY "Admins can update beta applications" 
ON public.beta_applications 
FOR UPDATE 
USING (public.is_admin_user((SELECT auth.uid())));

CREATE POLICY "System can create beta applications" 
ON public.beta_applications 
FOR INSERT 
WITH CHECK (true);

-- Create function to approve beta application
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
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin_user(v_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
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
  
  RETURN v_magic_link_token;
END;
$$;

-- Create function to reject beta application
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
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin_user(v_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
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
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_beta_applications_status ON public.beta_applications(status);
CREATE INDEX idx_beta_applications_email ON public.beta_applications(email);
CREATE INDEX idx_beta_applications_created_at ON public.beta_applications(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_beta_applications_updated_at
  BEFORE UPDATE ON public.beta_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();