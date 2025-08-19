-- Add admin support for prelaunch gate
-- Ensure profiles table has admin capabilities

-- Add admin column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'is_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create function to automatically set admin status for diasporanetwork.africa emails
CREATE OR REPLACE FUNCTION public.handle_admin_user_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if email is from diasporanetwork.africa domain
  IF NEW.email LIKE '%@diasporanetwork.africa' THEN
    -- Update profile to set admin status
    UPDATE public.profiles 
    SET is_admin = true 
    WHERE id = NEW.id;
    
    -- If no profile exists yet, insert one
    INSERT INTO public.profiles (id, email, is_admin, is_public)
    VALUES (NEW.id, NEW.email, true, true)
    ON CONFLICT (id) DO UPDATE SET
      is_admin = true,
      email = NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_admin_check ON auth.users;

-- Create trigger to handle admin user creation
CREATE TRIGGER on_auth_user_admin_check
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_user_creation();

-- Update existing diasporanetwork.africa users to be admins
UPDATE public.profiles 
SET is_admin = true 
WHERE email LIKE '%@diasporanetwork.africa';