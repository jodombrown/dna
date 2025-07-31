-- Fix function search path mutable security warnings

-- Fix calculate_match_score functions
CREATE OR REPLACE FUNCTION public.calculate_match_score(user1_regions text[], user1_sectors text[], user2_regions text[], user2_sectors text[])
 RETURNS numeric
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  region_overlap INTEGER;
  sector_overlap INTEGER;
  total_score DECIMAL := 0;
BEGIN
  -- Calculate region overlap
  SELECT array_length(ARRAY(
    SELECT unnest(user1_regions) 
    INTERSECT 
    SELECT unnest(user2_regions)
  ), 1) INTO region_overlap;
  
  -- Calculate sector overlap
  SELECT array_length(ARRAY(
    SELECT unnest(user1_sectors) 
    INTERSECT 
    SELECT unnest(user2_sectors)
  ), 1) INTO sector_overlap;
  
  -- Weight regions and sectors
  total_score := COALESCE(region_overlap, 0) * 0.4 + COALESCE(sector_overlap, 0) * 0.6;
  
  RETURN total_score;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_match_score(profile_id uuid, signal_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix find_adin_matches functions
CREATE OR REPLACE FUNCTION public.find_adin_matches(target_user_id uuid)
 RETURNS TABLE(matched_user_id uuid, match_score numeric, match_reason text, shared_regions text[], shared_sectors text[])
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH user_profile AS (
    SELECT region_focus, sector_focus 
    FROM adin_profiles 
    WHERE id = target_user_id
  ),
  potential_matches AS (
    SELECT 
      ap.id as matched_id,
      ap.region_focus,
      ap.sector_focus,
      calculate_match_score(
        up.region_focus, up.sector_focus,
        ap.region_focus, ap.sector_focus
      ) as score
    FROM adin_profiles ap, user_profile up
    WHERE ap.id != target_user_id 
    AND ap.region_focus IS NOT NULL 
    AND ap.sector_focus IS NOT NULL
    AND calculate_match_score(
      up.region_focus, up.sector_focus,
      ap.region_focus, ap.sector_focus
    ) > 0
  )
  SELECT 
    pm.matched_id,
    pm.score,
    CASE 
      WHEN pm.score >= 2 THEN 'Strong alignment in focus areas'
      WHEN pm.score >= 1 THEN 'Good potential for collaboration'
      ELSE 'Some shared interests'
    END as reason,
    ARRAY(
      SELECT unnest(up.region_focus) 
      INTERSECT 
      SELECT unnest(pm.region_focus)
    ) as regions,
    ARRAY(
      SELECT unnest(up.sector_focus) 
      INTERSECT 
      SELECT unnest(pm.sector_focus)
    ) as sectors
  FROM potential_matches pm, user_profile up
  ORDER BY pm.score DESC
  LIMIT 5;
END;
$function$;

CREATE OR REPLACE FUNCTION public.find_adin_matches(user_id uuid, match_threshold integer DEFAULT 60)
 RETURNS TABLE(signal_id uuid, signal_title text, signal_type text, match_score integer, signal_created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;