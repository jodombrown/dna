-- Fix security warnings: Set search_path for Profile v2 functions

CREATE OR REPLACE FUNCTION compute_profile_completion_score(profile_record profiles)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Identity & Hero (25 points)
  IF profile_record.full_name IS NOT NULL AND profile_record.full_name != '' THEN score := score + 5; END IF;
  IF profile_record.avatar_url IS NOT NULL THEN score := score + 5; END IF;
  IF profile_record.headline IS NOT NULL AND profile_record.headline != '' THEN score := score + 5; END IF;
  IF profile_record.professional_role IS NOT NULL AND profile_record.professional_role != '' THEN score := score + 5; END IF;
  IF profile_record.current_country IS NOT NULL AND profile_record.current_country != '' THEN score := score + 5; END IF;
  
  -- Diaspora Story (20 points)
  IF profile_record.bio IS NOT NULL AND LENGTH(profile_record.bio) > 50 THEN score := score + 15; END IF;
  IF profile_record.country_of_origin IS NOT NULL AND profile_record.country_of_origin != '' THEN score := score + 5; END IF;
  
  -- Skills & Contributions (20 points)
  IF COALESCE(array_length(profile_record.skills, 1), 0) >= 3 THEN score := score + 15; END IF;
  IF COALESCE(array_length(profile_record.available_for, 1), 0) >= 1 THEN score := score + 5; END IF;
  
  -- Interests & Focus (15 points)
  IF COALESCE(array_length(profile_record.interests, 1), 0) >= 3 THEN score := score + 10; END IF;
  IF COALESCE(array_length(profile_record.impact_areas, 1), 0) >= 1 THEN score := score + 5; END IF;
  
  -- Experience (20 points)
  IF profile_record.profession IS NOT NULL AND profile_record.profession != '' THEN score := score + 7; END IF;
  IF profile_record.company IS NOT NULL AND profile_record.company != '' THEN score := score + 7; END IF;
  IF profile_record.years_experience IS NOT NULL AND profile_record.years_experience > 0 THEN score := score + 6; END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION update_profile_completion_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_score := compute_profile_completion_score(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;