-- Ensure aweh@diasporanetwork.africa is properly set up as super admin
-- First, check if user exists and create admin record
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID for aweh@diasporanetwork.africa
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'aweh@diasporanetwork.africa';
  
  -- If user exists, ensure they have admin privileges
  IF admin_user_id IS NOT NULL THEN
    -- Insert or update admin record
    INSERT INTO public.admin_users (user_id, role, is_active, created_by)
    VALUES (admin_user_id, 'superadmin', true, admin_user_id)
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'superadmin',
      is_active = true,
      updated_at = now();
      
    -- Also ensure profile exists
    INSERT INTO public.profiles (id, email, full_name, is_public)
    VALUES (admin_user_id, 'aweh@diasporanetwork.africa', 'Super Admin', true)
    ON CONFLICT (id) DO UPDATE SET
      email = 'aweh@diasporanetwork.africa',
      full_name = COALESCE(profiles.full_name, 'Super Admin');
      
    RAISE NOTICE 'Admin user setup completed for aweh@diasporanetwork.africa';
  ELSE
    RAISE NOTICE 'User aweh@diasporanetwork.africa not found in auth.users table';
  END IF;
END
$$;