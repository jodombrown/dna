-- Create beta applications table for the approval process
CREATE TABLE public.beta_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  role TEXT,
  beta_phase TEXT NOT NULL,
  experience TEXT,
  motivation TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  magic_link_token TEXT UNIQUE,
  magic_link_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beta_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Beta applications can be viewed by admins" 
ON public.beta_applications FOR SELECT 
TO authenticated 
USING (is_admin_user(auth.uid()));

CREATE POLICY "System can create beta applications" 
ON public.beta_applications FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Admins can update beta applications" 
ON public.beta_applications FOR UPDATE 
TO authenticated 
USING (is_admin_user(auth.uid()));

-- Function to generate magic link tokens
CREATE OR REPLACE FUNCTION public.generate_magic_link_token()
RETURNS TEXT AS $$
DECLARE
  new_token TEXT;
  token_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a secure random token
    new_token := encode(gen_random_bytes(32), 'base64url');
    
    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM public.beta_applications WHERE magic_link_token = new_token) INTO token_exists;
    
    -- Exit loop if token is unique
    EXIT WHEN NOT token_exists;
  END LOOP;
  
  RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve beta application and generate magic link
CREATE OR REPLACE FUNCTION public.approve_beta_application(application_id UUID, admin_id UUID)
RETURNS TABLE(magic_link_token TEXT, expires_at TIMESTAMP WITH TIME ZONE) AS $$
DECLARE
  new_token TEXT;
  expiry_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate magic link token and set expiry (7 days)
  new_token := public.generate_magic_link_token();
  expiry_time := now() + INTERVAL '7 days';
  
  -- Update application status
  UPDATE public.beta_applications 
  SET 
    status = 'approved',
    reviewed_by = admin_id,
    reviewed_at = now(),
    magic_link_token = new_token,
    magic_link_expires_at = expiry_time,
    updated_at = now()
  WHERE id = application_id;
  
  RETURN QUERY SELECT new_token, expiry_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updated_at
CREATE TRIGGER update_beta_applications_updated_at
  BEFORE UPDATE ON public.beta_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();