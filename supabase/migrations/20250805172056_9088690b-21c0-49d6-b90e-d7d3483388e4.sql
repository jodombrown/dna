-- Add profile_completeness_score column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'profile_completeness_score') THEN
        ALTER TABLE public.profiles ADD COLUMN profile_completeness_score INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create or replace the function to calculate profile completeness  
CREATE OR REPLACE FUNCTION public.calculate_profile_completeness_score(p_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  score INTEGER := 0;
  total_fields INTEGER := 12; -- 10 text fields + 2 array fields
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM public.profiles WHERE id = p_id;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Count filled text fields
  IF profile_record.full_name IS NOT NULL AND profile_record.full_name != '' THEN score := score + 1; END IF;
  IF profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN score := score + 1; END IF;
  IF profile_record.avatar_url IS NOT NULL AND profile_record.avatar_url != '' THEN score := score + 1; END IF;
  IF profile_record.location IS NOT NULL AND profile_record.location != '' THEN score := score + 1; END IF;
  IF profile_record.current_role IS NOT NULL AND profile_record.current_role != '' THEN score := score + 1; END IF;
  IF profile_record.headline IS NOT NULL AND profile_record.headline != '' THEN score := score + 1; END IF;
  IF profile_record.city IS NOT NULL AND profile_record.city != '' THEN score := score + 1; END IF;
  IF profile_record.my_dna_statement IS NOT NULL AND profile_record.my_dna_statement != '' THEN score := score + 1; END IF;
  IF profile_record.linkedin_url IS NOT NULL AND profile_record.linkedin_url != '' THEN score := score + 1; END IF;
  IF profile_record.website_url IS NOT NULL AND profile_record.website_url != '' THEN score := score + 1; END IF;
  
  -- Count array fields
  IF profile_record.skills IS NOT NULL AND array_length(profile_record.skills, 1) > 0 THEN score := score + 1; END IF;
  IF profile_record.impact_areas IS NOT NULL AND array_length(profile_record.impact_areas, 1) > 0 THEN score := score + 1; END IF;
  
  RETURN ROUND((score::DECIMAL / total_fields) * 100);
END;
$$;

-- Create or replace trigger function to update profile completeness score
CREATE OR REPLACE FUNCTION public.update_profile_completeness_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.profile_completeness_score := public.calculate_profile_completeness_score(NEW.id);
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
SET profile_completeness_score = public.calculate_profile_completeness_score(id)
WHERE profile_completeness_score IS NULL OR profile_completeness_score = 0;