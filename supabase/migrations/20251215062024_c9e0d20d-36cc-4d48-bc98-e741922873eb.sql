-- Fix handle_new_user function to not include dots in username
-- The valid_username constraint requires: ^[a-z0-9_-]+$ (no dots allowed)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 1;
BEGIN
  -- Extract username from email (part before @)
  base_username := lower(split_part(NEW.email, '@', 1));
  
  -- Remove any non-alphanumeric characters except underscores and dashes
  -- NOTE: Dots are NOT allowed per valid_username constraint
  base_username := regexp_replace(base_username, '[^a-z0-9_-]', '', 'g');
  
  -- Ensure minimum length (constraint requires >= 3)
  IF length(base_username) < 3 THEN
    base_username := base_username || 'user';
  END IF;
  
  -- Ensure maximum length
  IF length(base_username) > 30 THEN
    base_username := substring(base_username, 1, 30);
  END IF;
  
  final_username := base_username;
  
  -- Handle duplicates by appending a number
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    final_username := base_username || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  -- Insert profile with auto-generated username
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    email,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', final_username),
    NEW.email,
    now(),
    now()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;