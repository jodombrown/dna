-- Fix profile auto-creation for new user signups
-- This ensures new users get a profile with username automatically

-- Drop the old trigger function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create updated trigger function that:
-- 1. Generates a username from email (before the @)
-- 2. Ensures username uniqueness
-- 3. Does NOT set onboarding_completed_at (so users go through onboarding)
-- 4. Does NOT set role (removed for security)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 1;
BEGIN
  -- Extract username from email (part before @)
  base_username := lower(split_part(NEW.email, '@', 1));
  
  -- Remove any non-alphanumeric characters except dots and dashes
  base_username := regexp_replace(base_username, '[^a-z0-9._-]', '', 'g');
  
  -- Ensure minimum length
  IF length(base_username) < 3 THEN
    base_username := base_username || '-user';
  END IF;
  
  -- Ensure maximum length
  IF length(base_username) > 30 THEN
    base_username := substring(base_username, 1, 30);
  END IF;
  
  final_username := base_username;
  
  -- Handle duplicates by appending a number
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    final_username := base_username || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  -- Insert profile with auto-generated username
  -- Explicitly do NOT set onboarding_completed_at so user goes to onboarding
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    email,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', final_username),
    NEW.email,
    now(),
    now()
  );
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO supabase_auth_admin;