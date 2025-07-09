-- Drop the previous trigger and function
DROP TRIGGER IF EXISTS auto_admin_creation_trigger ON auth.users;
DROP FUNCTION IF EXISTS public.auto_create_admin_user();

-- Updated function to handle @diasporanetwork.africa domain
CREATE OR REPLACE FUNCTION public.auto_create_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role admin_role;
BEGIN
  -- Check if email is from diasporanetwork.africa domain
  IF NEW.email LIKE '%@diasporanetwork.africa' THEN
    -- Determine role based on specific email
    IF NEW.email = 'aweh@diasporanetwork.africa' THEN
      user_role := 'superadmin';
    ELSE
      user_role := 'admin';
    END IF;
    
    -- Insert into admin_users table
    INSERT INTO public.admin_users (user_id, role, created_by)
    VALUES (NEW.id, user_role, NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Also create a profile entry
    INSERT INTO public.profiles (id, email, full_name, is_public)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin User'), true)
    ON CONFLICT (id) DO UPDATE SET
      email = NEW.email,
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', profiles.full_name, 'Admin User');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER auto_admin_creation_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_admin_user();

-- Function to protect aweh@diasporanetwork.africa from deletion
CREATE OR REPLACE FUNCTION public.protect_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  protected_email TEXT := 'aweh@diasporanetwork.africa';
  user_email TEXT;
BEGIN
  -- Get the email of the user being deleted
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = OLD.user_id;
  
  -- Prevent deletion of the protected super admin
  IF user_email = protected_email THEN
    RAISE EXCEPTION 'Cannot delete protected super admin: %', protected_email;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Create trigger to protect super admin from deletion
CREATE TRIGGER protect_super_admin_trigger
  BEFORE DELETE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_super_admin();

-- Update the manual admin creation function to handle domain
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id UUID;
  user_role admin_role;
BEGIN
  -- Find the user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;
  
  -- Determine role based on email
  IF user_email = 'aweh@diasporanetwork.africa' THEN
    user_role := 'superadmin';
  ELSIF user_email LIKE '%@diasporanetwork.africa' THEN
    user_role := 'admin';
  ELSE
    RETURN 'Email domain not authorized for admin privileges: ' || user_email;
  END IF;
  
  -- Insert into admin_users table
  INSERT INTO public.admin_users (user_id, role, created_by)
  VALUES (target_user_id, user_role, target_user_id)
  ON CONFLICT (user_id) DO UPDATE SET
    role = user_role,
    is_active = true,
    updated_at = now();
    
  RETURN 'Successfully made ' || user_email || ' a ' || user_role::text;
END;
$$;

-- Additional RLS policy to prevent deletion of protected super admin
CREATE POLICY "Cannot delete protected super admin" ON public.admin_users
  FOR DELETE
  USING (
    NOT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = admin_users.user_id 
      AND email = 'aweh@diasporanetwork.africa'
    )
  );