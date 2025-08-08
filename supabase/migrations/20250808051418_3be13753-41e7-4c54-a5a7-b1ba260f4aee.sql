-- Ensure profile rows exist and auto-create on signup
BEGIN;

-- 1) Ensure trigger exists to create profiles on new auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2) Backfill missing profiles for existing users (idempotent)
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  display_name,
  is_public,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', u.email) AS full_name,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', u.email) AS display_name,
  true,
  now(),
  now()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

COMMIT;