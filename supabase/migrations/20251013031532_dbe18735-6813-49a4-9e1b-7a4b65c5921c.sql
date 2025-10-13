-- FIX #3: Standardize profile completion field
-- Use ONLY profile_completion_percentage going forward
-- Deprecate profile_completeness_score and profile_completion_score

-- Step 1: Drop the existing trigger CASCADE (this will drop dependent objects)
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.update_profile_completion() CASCADE;

-- Step 2: Create the new trigger function that ONLY uses profile_completion_percentage
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  old_completion INTEGER;
  new_completion INTEGER;
BEGIN
  old_completion := COALESCE(OLD.profile_completion_percentage, 0);
  new_completion := public.calculate_profile_completion_percentage(NEW.id);
  
  -- ONLY set profile_completion_percentage
  NEW.profile_completion_percentage := new_completion;
  
  -- Emit profile_completed event when crossing 40% threshold
  IF old_completion < 40 AND new_completion >= 40 THEN
    INSERT INTO public.events_log (event_type, user_id, payload)
    VALUES (
      'profile_completed',
      NEW.id,
      jsonb_build_object(
        'completion_percentage', new_completion,
        'africa_focus_areas', COALESCE(NEW.africa_focus_areas, ARRAY[]::TEXT[]),
        'intentions', COALESCE(NEW.intentions, ARRAY[]::TEXT[])
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 3: Recreate the trigger
CREATE TRIGGER trigger_update_profile_completion
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_profile_completion();

-- Step 4: Migrate existing data from old columns to profile_completion_percentage
UPDATE public.profiles
SET profile_completion_percentage = COALESCE(
  profile_completion_percentage,
  profile_completeness_score,
  profile_completion_score,
  0
)
WHERE profile_completion_percentage IS NULL
  OR (profile_completion_percentage = 0 AND (profile_completeness_score > 0 OR profile_completion_score > 0));

-- Step 5: Add helpful comments marking deprecated columns
COMMENT ON COLUMN public.profiles.profile_completeness_score IS 'DEPRECATED: Use profile_completion_percentage instead';
COMMENT ON COLUMN public.profiles.profile_completion_score IS 'DEPRECATED: Use profile_completion_percentage instead';

-- Note: Keeping deprecated columns for backwards compatibility
-- They can be dropped in a future migration once fully tested