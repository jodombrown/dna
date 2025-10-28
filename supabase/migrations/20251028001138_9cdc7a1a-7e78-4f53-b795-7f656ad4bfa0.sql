-- Fix profile completion function to use correct mentorship columns
CREATE OR REPLACE FUNCTION public.calculate_profile_completion_percentage(profile_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  score INTEGER := 0;
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM public.profiles WHERE id = profile_id;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Core Information (40 points total - minimum to unlock other modules)
  IF profile_record.full_name IS NOT NULL AND length(profile_record.full_name) > 0 THEN score := score + 10; END IF;
  IF profile_record.headline IS NOT NULL AND length(profile_record.headline) > 0 THEN score := score + 10; END IF;
  IF profile_record.bio IS NOT NULL AND length(profile_record.bio) > 50 THEN score := score + 10; END IF;
  IF profile_record.location IS NOT NULL AND length(profile_record.location) > 0 THEN score := score + 10; END IF;
  
  -- Professional Details (20 points)
  IF profile_record.profession IS NOT NULL AND length(profile_record.profession) > 0 THEN score := score + 5; END IF;
  IF profile_record.company IS NOT NULL AND length(profile_record.company) > 0 THEN score := score + 5; END IF;
  IF profile_record.linkedin_url IS NOT NULL AND length(profile_record.linkedin_url) > 0 THEN score := score + 5; END IF;
  IF profile_record.years_experience IS NOT NULL AND profile_record.years_experience > 0 THEN score := score + 5; END IF;
  
  -- Skills & Interests (15 points)
  IF profile_record.skills IS NOT NULL AND array_length(profile_record.skills, 1) >= 3 THEN score := score + 10; END IF;
  IF profile_record.interests IS NOT NULL AND array_length(profile_record.interests, 1) >= 2 THEN score := score + 5; END IF;
  
  -- Heritage & Identity (10 points)
  IF profile_record.country_of_origin IS NOT NULL AND length(profile_record.country_of_origin) > 0 THEN score := score + 5; END IF;
  IF profile_record.current_country IS NOT NULL AND length(profile_record.current_country) > 0 THEN score := score + 5; END IF;
  
  -- Engagement Flags (10 points) - Use correct column names
  IF profile_record.mentorship_offering = true THEN score := score + 5; END IF;
  IF profile_record.open_to_opportunities = true THEN score := score + 5; END IF;
  
  -- Visual elements (5 points)
  IF profile_record.avatar_url IS NOT NULL AND length(profile_record.avatar_url) > 0 THEN score := score + 5; END IF;
  
  RETURN score;
END;
$$;