-- Fix security warnings by setting search_path on functions

-- Fix normalize_username_trg function
DROP FUNCTION IF EXISTS public.normalize_username_trg() CASCADE;
CREATE OR REPLACE FUNCTION public.normalize_username_trg()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN
    NEW.username := lower(trim(NEW.username));
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS normalize_username ON public.profiles;
CREATE TRIGGER normalize_username
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_username_trg();

-- Fix update_profile_completion_score function
DROP FUNCTION IF EXISTS public.update_profile_completion_score() CASCADE;
CREATE OR REPLACE FUNCTION public.update_profile_completion_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.profile_completion_score := calculate_profile_completion_score(NEW.id);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS update_profile_score ON public.profiles;
CREATE TRIGGER update_profile_score
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_completion_score();

-- Fix set_profile_username function  
DROP FUNCTION IF EXISTS public.set_profile_username() CASCADE;
CREATE OR REPLACE FUNCTION public.set_profile_username()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only set username if it's not already set and we have a full_name
  IF NEW.username IS NULL AND NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN
    NEW.username = public.generate_username_from_name(NEW.full_name);
    
    -- Handle duplicates by appending a number
    DECLARE
      base_username TEXT := NEW.username;
      counter INTEGER := 1;
    BEGIN
      WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = NEW.username AND id != NEW.id) LOOP
        NEW.username = base_username || '-' || counter;
        counter = counter + 1;
      END LOOP;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger if it exists
DROP TRIGGER IF EXISTS set_username ON public.profiles;
CREATE TRIGGER set_username
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profile_username();