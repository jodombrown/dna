-- Fix profile creation trigger to handle LinkedIn OAuth data properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_full_name TEXT;
BEGIN
  -- Extract full name from different OAuth providers
  IF NEW.raw_user_meta_data->>'name' IS NOT NULL THEN
    -- LinkedIn and other providers that use 'name'
    user_full_name := NEW.raw_user_meta_data->>'name';
  ELSIF NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
    -- Email signup and other providers that use 'full_name'
    user_full_name := NEW.raw_user_meta_data->>'full_name';
  ELSE
    -- Fallback to email if no name is provided
    user_full_name := NEW.email;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_full_name
  );
  RETURN NEW;
END;
$$;

-- Create missing profiles for existing users
INSERT INTO public.profiles (id, email, full_name, display_name)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'full_name',
    u.email
  ) as full_name,
  COALESCE(
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'full_name',
    u.email
  ) as display_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Update existing LinkedIn profile with correct name
UPDATE public.profiles 
SET 
  full_name = COALESCE(
    (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = profiles.id),
    full_name
  ),
  display_name = COALESCE(
    (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = profiles.id),
    display_name
  )
WHERE id = '750783be-b3c9-4c57-9f68-cbffbbcc4bd3';