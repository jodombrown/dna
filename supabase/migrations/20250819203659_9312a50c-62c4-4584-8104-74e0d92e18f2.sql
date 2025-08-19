-- Server-side prelaunch protection functions
-- These functions provide backend enforcement of the prelaunch gate

-- Create function to check if prelaunch is locked
CREATE OR REPLACE FUNCTION public.is_prelaunch_locked()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  launch_time TIMESTAMPTZ := '2025-09-01 16:00:00+00'::TIMESTAMPTZ; -- 9:00 AM PT
BEGIN
  -- Always allow access after launch time
  IF NOW() >= launch_time THEN
    RETURN FALSE;
  END IF;
  
  -- During prelaunch, only allow if explicitly disabled (for testing)
  -- This can be controlled by environment or configuration
  RETURN TRUE;
END;
$$;

-- Create function to check if email is admin
CREATE OR REPLACE FUNCTION public.is_admin_email(email_address TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF email_address IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if email ends with admin domain
  RETURN LOWER(email_address) LIKE '%@diasporanetwork.africa';
END;
$$;

-- Create function to validate prelaunch access
CREATE OR REPLACE FUNCTION public.validate_prelaunch_access(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If prelaunch is not locked, allow access
  IF NOT public.is_prelaunch_locked() THEN
    RETURN TRUE;
  END IF;
  
  -- During prelaunch, only allow admin emails
  RETURN public.is_admin_email(user_email);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_prelaunch_locked() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_email(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.validate_prelaunch_access(TEXT) TO authenticated, anon;