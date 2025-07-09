-- Function to automatically create admin user for specific email
CREATE OR REPLACE FUNCTION public.auto_create_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if this is the designated admin email
  IF NEW.email = 'aweh@diasporanetwork.africa' THEN
    -- Insert into admin_users table with superadmin role
    INSERT INTO public.admin_users (user_id, role, created_by)
    VALUES (NEW.id, 'superadmin', NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Also create a profile entry
    INSERT INTO public.profiles (id, email, full_name, is_public)
    VALUES (NEW.id, NEW.email, 'Admin User', true)
    ON CONFLICT (id) DO UPDATE SET
      email = NEW.email,
      full_name = COALESCE(profiles.full_name, 'Admin User');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users insert
DROP TRIGGER IF EXISTS auto_admin_creation_trigger ON auth.users;
CREATE TRIGGER auto_admin_creation_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_admin_user();

-- Manual insertion function (in case the user already exists)
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find the user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;
  
  -- Insert into admin_users table
  INSERT INTO public.admin_users (user_id, role, created_by)
  VALUES (target_user_id, 'superadmin', target_user_id)
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'superadmin',
    is_active = true,
    updated_at = now();
    
  RETURN 'Successfully made ' || user_email || ' a superadmin';
END;
$$;