-- Ensure admin user exists and create if needed
DO $$
BEGIN
  -- Check if the admin user exists
  IF NOT EXISTS (
    SELECT 1 FROM admin_users au 
    JOIN auth.users u ON au.user_id = u.id 
    WHERE u.email = 'aweh@diasporanetwork.africa'
  ) THEN
    -- Find the user in auth.users
    INSERT INTO admin_users (user_id, role, is_active, created_by)
    SELECT 
      u.id,
      'superadmin'::admin_role,
      true,
      u.id
    FROM auth.users u
    WHERE u.email = 'aweh@diasporanetwork.africa'
    ON CONFLICT (user_id) DO UPDATE SET
      is_active = true,
      role = 'superadmin'::admin_role;
  END IF;
END $$;