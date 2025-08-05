-- Add profile_completeness_score column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'profile_completeness_score') THEN
        ALTER TABLE public.profiles ADD COLUMN profile_completeness_score INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create or replace the function to calculate profile completeness
CREATE OR REPLACE FUNCTION public.calculate_profile_completeness_score(profile_data JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  score INTEGER := 0;
  total_fields INTEGER := 12; -- 10 text fields + 2 array fields
BEGIN
  -- Count filled text fields
  IF profile_data->>'full_name' IS NOT NULL AND profile_data->>'full_name' != '' THEN score := score + 1; END IF;
  IF profile_data->>'bio' IS NOT NULL AND profile_data->>'bio' != '' THEN score := score + 1; END IF;
  IF profile_data->>'avatar_url' IS NOT NULL AND profile_data->>'avatar_url' != '' THEN score := score + 1; END IF;
  IF profile_data->>'location' IS NOT NULL AND profile_data->>'location' != '' THEN score := score + 1; END IF;
  IF profile_data->>'current_role' IS NOT NULL AND profile_data->>'current_role' != '' THEN score := score + 1; END IF;
  IF profile_data->>'headline' IS NOT NULL AND profile_data->>'headline' != '' THEN score := score + 1; END IF;
  IF profile_data->>'city' IS NOT NULL AND profile_data->>'city' != '' THEN score := score + 1; END IF;
  IF profile_data->>'my_dna_statement' IS NOT NULL AND profile_data->>'my_dna_statement' != '' THEN score := score + 1; END IF;
  IF profile_data->>'linkedin_url' IS NOT NULL AND profile_data->>'linkedin_url' != '' THEN score := score + 1; END IF;
  IF profile_data->>'website_url' IS NOT NULL AND profile_data->>'website_url' != '' THEN score := score + 1; END IF;
  
  -- Count array fields
  IF profile_data->'skills' IS NOT NULL AND jsonb_array_length(profile_data->'skills') > 0 THEN score := score + 1; END IF;
  IF profile_data->'impact_areas' IS NOT NULL AND jsonb_array_length(profile_data->'impact_areas') > 0 THEN score := score + 1; END IF;
  
  RETURN ROUND((score::DECIMAL / total_fields) * 100);
END;
$$;

-- Create or replace trigger function to update profile completeness score
CREATE OR REPLACE FUNCTION public.update_profile_completeness_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.profile_completeness_score := public.calculate_profile_completeness_score(to_jsonb(NEW));
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_update_profile_completeness ON public.profiles;
CREATE TRIGGER trigger_update_profile_completeness
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_completeness_trigger();

-- Update existing profiles with calculated scores
UPDATE public.profiles 
SET profile_completeness_score = public.calculate_profile_completeness_score(to_jsonb(profiles))
WHERE profile_completeness_score IS NULL OR profile_completeness_score = 0;