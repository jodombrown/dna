-- Create admin profile for aweh@diasporanetwork.africa
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  first_name,
  last_name,
  current_country,
  avatar_url,
  professional_sectors,
  interests,
  is_public,
  updated_at,
  created_at
) VALUES (
  'c621a1b6-e51c-4952-810c-e55be42d9310', -- Use a known UUID for consistency
  'aweh@diasporanetwork.africa',
  'Aweh Admin',
  'Aweh',
  'Admin',
  'Ghana',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=aweh',
  ARRAY['Technology', 'Business Development'],
  ARRAY['Community Building', 'Innovation'],
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = now();

-- Make aweh@diasporanetwork.africa an admin
INSERT INTO public.admin_users (
  user_id,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'c621a1b6-e51c-4952-810c-e55be42d9310',
  'superadmin',
  true,
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  role = 'superadmin',
  is_active = true,
  updated_at = now();