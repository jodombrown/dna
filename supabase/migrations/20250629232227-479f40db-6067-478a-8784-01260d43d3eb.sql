
-- First, insert the profiles for both users (if they don't exist)
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
VALUES 
  ('ad2f426c-5ff2-47cf-90f5-6f209d7db6c6', 'admin1@example.com', 'Super Admin 1', now(), now()),
  ('8d816c69-7cfb-409c-82f1-0d68256ca835', 'admin2@example.com', 'Super Admin 2', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Then insert the admin users
INSERT INTO public.admin_users (user_id, role, is_active, created_at)
VALUES 
  ('ad2f426c-5ff2-47cf-90f5-6f209d7db6c6', 'super_admin', true, now()),
  ('8d816c69-7cfb-409c-82f1-0d68256ca835', 'super_admin', true, now())
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  is_active = true,
  updated_at = now();
