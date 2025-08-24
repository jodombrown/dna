-- Create admin profile using existing structure
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  first_name,
  last_name,
  current_country,
  avatar_url,
  sectors,
  interests,
  is_public,
  is_admin,
  updated_at,
  created_at
) VALUES (
  'a0a0a0a0-e000-4000-8000-000000000001', -- Fixed admin UUID
  'aweh@diasporanetwork.africa',
  'Aweh Admin',
  'Aweh',
  'Admin',
  'Ghana',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=aweh',
  ARRAY['Technology', 'Business Development'],
  ARRAY['Community Building', 'Innovation'],
  true,
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  is_admin = true,
  updated_at = now();

-- Make aweh@diasporanetwork.africa an admin
INSERT INTO public.admin_users (
  user_id,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'a0a0a0a0-e000-4000-8000-000000000001',
  'superadmin',
  true,
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  role = 'superadmin',
  is_active = true,
  updated_at = now();