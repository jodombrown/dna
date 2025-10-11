-- Fix search_path security issue for calculate_profile_completion_score
CREATE OR REPLACE FUNCTION public.calculate_profile_completion_score(profile_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    score INTEGER := 0;
    profile_record RECORD;
BEGIN
    SELECT * INTO profile_record FROM profiles WHERE id = profile_id;
    
    -- Basic info (30 points)
    IF profile_record.full_name IS NOT NULL AND LENGTH(profile_record.full_name) > 0 THEN
        score := score + 10;
    END IF;
    
    IF profile_record.bio IS NOT NULL AND LENGTH(profile_record.bio) > 50 THEN
        score := score + 10;
    END IF;
    
    IF profile_record.headline IS NOT NULL AND LENGTH(profile_record.headline) > 0 THEN
        score := score + 10;
    END IF;
    
    -- Professional info (40 points)
    IF profile_record.profession IS NOT NULL AND LENGTH(profile_record.profession) > 0 THEN
        score := score + 10;
    END IF;
    
    IF profile_record.company IS NOT NULL AND LENGTH(profile_record.company) > 0 THEN
        score := score + 10;
    END IF;
    
    IF profile_record.skills IS NOT NULL AND array_length(profile_record.skills, 1) >= 3 THEN
        score := score + 20;
    END IF;
    
    -- Diaspora info (30 points)
    IF profile_record.country_of_origin IS NOT NULL AND LENGTH(profile_record.country_of_origin) > 0 THEN
        score := score + 10;
    END IF;
    
    IF profile_record.location IS NOT NULL AND LENGTH(profile_record.location) > 0 THEN
        score := score + 10;
    END IF;
    
    IF profile_record.diaspora_story IS NOT NULL AND LENGTH(profile_record.diaspora_story) > 0 THEN
        score := score + 10;
    END IF;
    
    RETURN score;
END;
$function$;