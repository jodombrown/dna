-- Fix function search path warnings by setting search_path for security

-- Update functions that don't have search_path set

-- Fix generate_username_from_name function
CREATE OR REPLACE FUNCTION public.generate_username_from_name(full_name text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = 'public'
AS $function$
BEGIN
  IF full_name IS NULL OR full_name = '' THEN
    RETURN NULL;
  END IF;
  
  -- Convert to lowercase, replace spaces with dashes, remove special chars
  RETURN lower(
    regexp_replace(
      regexp_replace(trim(full_name), '[^a-zA-Z0-9\s]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
END;
$function$;

-- Fix set_beta_expiration function
CREATE OR REPLACE FUNCTION public.set_beta_expiration()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  -- If is_beta_tester is being set to true and beta_expires_at is null, set 10-day expiration
  IF NEW.is_beta_tester = true AND OLD.is_beta_tester = false AND NEW.beta_expires_at IS NULL THEN
    NEW.beta_expires_at = NOW() + INTERVAL '10 days';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix set_profile_username function
CREATE OR REPLACE FUNCTION public.set_profile_username()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  -- Only set username if it's not already set and we have a full_name
  IF NEW.username IS NULL AND NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN
    NEW.username = public.generate_username_from_name(NEW.full_name);
    
    -- Handle duplicates by appending a number
    DECLARE
      base_username TEXT := NEW.username;
      counter INTEGER := 1;
    BEGIN
      WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = NEW.username AND id != NEW.id) LOOP
        NEW.username = base_username || '-' || counter;
        counter = counter + 1;
      END LOOP;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix generate_magic_link_token function
CREATE OR REPLACE FUNCTION public.generate_magic_link_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Fix approve_beta_application function
CREATE OR REPLACE FUNCTION public.approve_beta_application(application_id uuid, admin_id uuid)
 RETURNS TABLE(magic_link_token text, expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;