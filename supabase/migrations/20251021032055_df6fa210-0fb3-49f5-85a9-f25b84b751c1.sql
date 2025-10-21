-- Fix calculate_profile_completion_percentage function to remove languages_spoken reference

CREATE OR REPLACE FUNCTION calculate_profile_completion_percentage(profile_id uuid)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
  score INTEGER := 0;
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = profile_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Basic Info (30 points)
  IF profile_record.avatar_url IS NOT NULL THEN score := score + 10; END IF;
  IF profile_record.full_name IS NOT NULL AND length(profile_record.full_name) > 0 THEN score := score + 5; END IF;
  IF profile_record.username IS NOT NULL AND length(profile_record.username) > 0 THEN score := score + 5; END IF;
  IF profile_record.headline IS NOT NULL AND length(profile_record.headline) > 0 THEN score := score + 5; END IF;
  IF profile_record.bio IS NOT NULL AND length(profile_record.bio) > 50 THEN score := score + 5; END IF;
  
  -- Professional Info (20 points)
  IF profile_record.profession IS NOT NULL AND length(profile_record.profession) > 0 THEN score := score + 5; END IF;
  IF profile_record.company IS NOT NULL AND length(profile_record.company) > 0 THEN score := score + 5; END IF;
  IF array_length(profile_record.skills, 1) >= 3 THEN score := score + 10; END IF;
  
  -- Discovery Tags (30 points) - CRITICAL FOR FINDABILITY
  IF array_length(profile_record.focus_areas, 1) >= 2 THEN score := score + 10; END IF;
  IF array_length(profile_record.regional_expertise, 1) >= 1 THEN score := score + 10; END IF;
  IF array_length(profile_record.industries, 1) >= 2 THEN score := score + 10; END IF;
  
  -- Heritage & Identity (10 points) - removed languages_spoken, use current_country instead
  IF profile_record.country_of_origin IS NOT NULL AND length(profile_record.country_of_origin) > 0 THEN score := score + 5; END IF;
  IF profile_record.current_country IS NOT NULL AND length(profile_record.current_country) > 0 THEN score := score + 5; END IF;
  
  -- Engagement Flags (10 points)
  IF profile_record.availability_for_mentoring = true THEN score := score + 5; END IF;
  IF profile_record.looking_for_opportunities = true THEN score := score + 5; END IF;
  
  RETURN score;
END;
$$;