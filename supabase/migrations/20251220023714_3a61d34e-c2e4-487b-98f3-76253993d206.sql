-- Create function to auto-create adin_preferences for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_adin_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.adin_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table (fires after profile is created)
DROP TRIGGER IF EXISTS on_profile_created_adin_preferences ON public.profiles;
CREATE TRIGGER on_profile_created_adin_preferences
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_adin_preferences();

-- Backfill: Create preferences for all existing users who don't have them
INSERT INTO public.adin_preferences (user_id)
SELECT id FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.adin_preferences)
ON CONFLICT (user_id) DO NOTHING;