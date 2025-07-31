-- Fix search_path warnings for database functions

-- Update calculate_match_score function
DROP FUNCTION IF EXISTS public.calculate_match_score(profile_id uuid, signal_id uuid);

CREATE OR REPLACE FUNCTION public.calculate_match_score(profile_id uuid, signal_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    score integer := 0;
    profile_data record;
    signal_data record;
BEGIN
    -- Get profile data
    SELECT skills, interests, professional_sectors, diaspora_networks, location, country_of_origin
    INTO profile_data
    FROM profiles 
    WHERE id = profile_id;
    
    -- Get signal data  
    SELECT skills_required, interests_relevant, sectors_relevant, locations_relevant, signal_type
    INTO signal_data
    FROM adin_signals
    WHERE id = signal_id;
    
    -- Calculate score based on matching criteria
    -- Skills match (40% weight)
    IF profile_data.skills && signal_data.skills_required THEN
        score := score + 40;
    END IF;
    
    -- Interests match (20% weight)
    IF profile_data.interests && signal_data.interests_relevant THEN
        score := score + 20;
    END IF;
    
    -- Sectors match (20% weight)
    IF profile_data.professional_sectors && signal_data.sectors_relevant THEN
        score := score + 20;
    END IF;
    
    -- Location match (20% weight)
    IF profile_data.location = ANY(signal_data.locations_relevant) OR 
       profile_data.country_of_origin = ANY(signal_data.locations_relevant) THEN
        score := score + 20;
    END IF;
    
    RETURN score;
END;
$$;

-- Update find_adin_matches function
DROP FUNCTION IF EXISTS public.find_adin_matches(user_id uuid, match_threshold integer);

CREATE OR REPLACE FUNCTION public.find_adin_matches(user_id uuid, match_threshold integer DEFAULT 60)
RETURNS TABLE (
    signal_id uuid,
    signal_title text,
    signal_type text,
    match_score integer,
    signal_created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        s.signal_type,
        calculate_match_score(user_id, s.id) as score,
        s.created_at
    FROM adin_signals s
    WHERE s.is_active = true
      AND calculate_match_score(user_id, s.id) >= match_threshold
    ORDER BY score DESC, s.created_at DESC
    LIMIT 20;
END;
$$;