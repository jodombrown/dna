-- Drop the old 11-argument version that hardcodes match_score to 100
DROP FUNCTION IF EXISTS public.discover_members(uuid, text[], text[], text[], text, text, text[], text, text, int, int);

-- Create improved discover_members function with real match scoring algorithm
CREATE OR REPLACE FUNCTION public.discover_members(
  p_current_user_id UUID,
  p_focus_areas TEXT[] DEFAULT NULL,
  p_regional_expertise TEXT[] DEFAULT NULL,
  p_industries TEXT[] DEFAULT NULL,
  p_country_of_origin TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL,
  p_skills TEXT[] DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'match',
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,
  focus_areas TEXT[],
  regional_expertise TEXT[],
  industries TEXT[],
  skills TEXT[],
  country_of_origin TEXT,
  current_country TEXT,
  match_score INT,
  is_connected BOOLEAN,
  available_for TEXT[],
  languages TEXT[],
  diaspora_status TEXT,
  is_mentor BOOLEAN,
  is_investor BOOLEAN,
  location TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_focus_areas TEXT[];
  current_user_regional_expertise TEXT[];
  current_user_industries TEXT[];
  current_user_skills TEXT[];
  current_user_country_of_origin TEXT;
  current_user_current_country TEXT;
  current_user_languages TEXT[];
  current_user_available_for TEXT[];
BEGIN
  -- Get current user's profile data for comparison
  SELECT 
    COALESCE(p.focus_areas, ARRAY[]::TEXT[]),
    COALESCE(p.regional_expertise, ARRAY[]::TEXT[]),
    COALESCE(p.industries, ARRAY[]::TEXT[]),
    COALESCE(p.skills, ARRAY[]::TEXT[]),
    p.country_of_origin,
    p.current_country,
    COALESCE(p.languages, ARRAY[]::TEXT[]),
    COALESCE(p.available_for, ARRAY[]::TEXT[])
  INTO 
    current_user_focus_areas,
    current_user_regional_expertise,
    current_user_industries,
    current_user_skills,
    current_user_country_of_origin,
    current_user_current_country,
    current_user_languages,
    current_user_available_for
  FROM profiles p
  WHERE p.id = p_current_user_id;

  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.headline,
    p.focus_areas,
    p.regional_expertise,
    p.industries,
    p.skills,
    p.country_of_origin,
    p.current_country,
    -- Calculate real match score based on profile data overlap
    GREATEST(0, LEAST(100, (
      -- Base score for having a profile (5 points)
      5 +
      
      -- Focus areas match (max 20 points)
      CASE 
        WHEN array_length(COALESCE(p.focus_areas, ARRAY[]::TEXT[]) & current_user_focus_areas, 1) >= 3 THEN 20
        WHEN array_length(COALESCE(p.focus_areas, ARRAY[]::TEXT[]) & current_user_focus_areas, 1) = 2 THEN 14
        WHEN array_length(COALESCE(p.focus_areas, ARRAY[]::TEXT[]) & current_user_focus_areas, 1) = 1 THEN 7
        ELSE 0
      END +
      
      -- Regional expertise match (max 15 points)
      CASE 
        WHEN array_length(COALESCE(p.regional_expertise, ARRAY[]::TEXT[]) & current_user_regional_expertise, 1) >= 2 THEN 15
        WHEN array_length(COALESCE(p.regional_expertise, ARRAY[]::TEXT[]) & current_user_regional_expertise, 1) = 1 THEN 8
        ELSE 0
      END +
      
      -- Industries match (max 15 points)
      CASE 
        WHEN array_length(COALESCE(p.industries, ARRAY[]::TEXT[]) & current_user_industries, 1) >= 2 THEN 15
        WHEN array_length(COALESCE(p.industries, ARRAY[]::TEXT[]) & current_user_industries, 1) = 1 THEN 8
        ELSE 0
      END +
      
      -- Skills match (max 15 points)
      CASE 
        WHEN array_length(COALESCE(p.skills, ARRAY[]::TEXT[]) & current_user_skills, 1) >= 3 THEN 15
        WHEN array_length(COALESCE(p.skills, ARRAY[]::TEXT[]) & current_user_skills, 1) = 2 THEN 10
        WHEN array_length(COALESCE(p.skills, ARRAY[]::TEXT[]) & current_user_skills, 1) = 1 THEN 5
        ELSE 0
      END +
      
      -- Same country of origin (15 points)
      CASE 
        WHEN current_user_country_of_origin IS NOT NULL 
          AND p.country_of_origin IS NOT NULL 
          AND LOWER(p.country_of_origin) = LOWER(current_user_country_of_origin) 
        THEN 15
        ELSE 0
      END +
      
      -- Same current location (10 points)
      CASE 
        WHEN current_user_current_country IS NOT NULL 
          AND p.current_country IS NOT NULL 
          AND LOWER(p.current_country) = LOWER(current_user_current_country) 
        THEN 10
        ELSE 0
      END +
      
      -- Shared languages (max 5 points)
      CASE 
        WHEN array_length(COALESCE(p.languages, ARRAY[]::TEXT[]) & current_user_languages, 1) >= 1 THEN 5
        ELSE 0
      END +
      
      -- Complementary collaboration (max 15 points total)
      -- Hiring <-> Job Seeking
      CASE 
        WHEN ('hiring' = ANY(current_user_available_for) AND 'job_seeking' = ANY(COALESCE(p.available_for, ARRAY[]::TEXT[])))
          OR ('job_seeking' = ANY(current_user_available_for) AND 'hiring' = ANY(COALESCE(p.available_for, ARRAY[]::TEXT[])))
        THEN 8
        ELSE 0
      END +
      -- Mentoring <-> Being Mentored
      CASE 
        WHEN ('mentoring' = ANY(current_user_available_for) AND 'being_mentored' = ANY(COALESCE(p.available_for, ARRAY[]::TEXT[])))
          OR ('being_mentored' = ANY(current_user_available_for) AND 'mentoring' = ANY(COALESCE(p.available_for, ARRAY[]::TEXT[])))
        THEN 7
        ELSE 0
      END +
      
      -- Profile quality bonus (max 5 points) - only give bonus if profile has enough data
      CASE 
        WHEN array_length(p.focus_areas, 1) >= 2 
          AND array_length(p.skills, 1) >= 3 
          AND p.headline IS NOT NULL 
          AND p.bio IS NOT NULL 
        THEN 5
        ELSE 0
      END
      
    )))::INT AS match_score,
    
    EXISTS (
      SELECT 1 FROM connections c
      WHERE ((c.requester_id = p_current_user_id AND c.recipient_id = p.id)
         OR (c.recipient_id = p_current_user_id AND c.requester_id = p.id))
        AND c.status = 'accepted'
    ) as is_connected,
    
    p.available_for,
    p.languages,
    p.diaspora_status,
    p.is_mentor,
    p.is_investor,
    p.location
    
  FROM profiles p
  WHERE p.id != p_current_user_id
    AND p.is_public = true
    AND p.id IN (SELECT au.id FROM auth.users au WHERE au.deleted_at IS NULL)
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users bu
      WHERE (bu.blocker_id = p_current_user_id AND bu.blocked_id = p.id)
         OR (bu.blocker_id = p.id AND bu.blocked_id = p_current_user_id)
    )
    -- Apply search filter
    AND (
      p_search_query IS NULL 
      OR p.full_name ILIKE '%' || p_search_query || '%'
      OR p.username ILIKE '%' || p_search_query || '%'
      OR p.headline ILIKE '%' || p_search_query || '%'
      OR p.bio ILIKE '%' || p_search_query || '%'
    )
    -- Apply array filters
    AND (p_focus_areas IS NULL OR p.focus_areas && p_focus_areas)
    AND (p_regional_expertise IS NULL OR p.regional_expertise && p_regional_expertise)
    AND (p_industries IS NULL OR p.industries && p_industries)
    AND (p_skills IS NULL OR p.skills && p_skills)
    -- Apply country filters
    AND (p_country_of_origin IS NULL OR p.country_of_origin ILIKE '%' || p_country_of_origin || '%')
    AND (p_location_country IS NULL OR p.current_country ILIKE '%' || p_location_country || '%')
  ORDER BY 
    CASE WHEN p_sort_by = 'match' THEN 1 ELSE 0 END * (
      -- Inline match score calculation for ordering
      GREATEST(0, LEAST(100, (
        5 +
        CASE 
          WHEN array_length(COALESCE(p.focus_areas, ARRAY[]::TEXT[]) & current_user_focus_areas, 1) >= 3 THEN 20
          WHEN array_length(COALESCE(p.focus_areas, ARRAY[]::TEXT[]) & current_user_focus_areas, 1) = 2 THEN 14
          WHEN array_length(COALESCE(p.focus_areas, ARRAY[]::TEXT[]) & current_user_focus_areas, 1) = 1 THEN 7
          ELSE 0
        END +
        CASE 
          WHEN array_length(COALESCE(p.regional_expertise, ARRAY[]::TEXT[]) & current_user_regional_expertise, 1) >= 2 THEN 15
          WHEN array_length(COALESCE(p.regional_expertise, ARRAY[]::TEXT[]) & current_user_regional_expertise, 1) = 1 THEN 8
          ELSE 0
        END +
        CASE 
          WHEN array_length(COALESCE(p.industries, ARRAY[]::TEXT[]) & current_user_industries, 1) >= 2 THEN 15
          WHEN array_length(COALESCE(p.industries, ARRAY[]::TEXT[]) & current_user_industries, 1) = 1 THEN 8
          ELSE 0
        END +
        CASE 
          WHEN array_length(COALESCE(p.skills, ARRAY[]::TEXT[]) & current_user_skills, 1) >= 3 THEN 15
          WHEN array_length(COALESCE(p.skills, ARRAY[]::TEXT[]) & current_user_skills, 1) = 2 THEN 10
          WHEN array_length(COALESCE(p.skills, ARRAY[]::TEXT[]) & current_user_skills, 1) = 1 THEN 5
          ELSE 0
        END +
        CASE 
          WHEN current_user_country_of_origin IS NOT NULL 
            AND p.country_of_origin IS NOT NULL 
            AND LOWER(p.country_of_origin) = LOWER(current_user_country_of_origin) 
          THEN 15
          ELSE 0
        END +
        CASE 
          WHEN current_user_current_country IS NOT NULL 
            AND p.current_country IS NOT NULL 
            AND LOWER(p.current_country) = LOWER(current_user_current_country) 
          THEN 10
          ELSE 0
        END +
        CASE 
          WHEN array_length(COALESCE(p.languages, ARRAY[]::TEXT[]) & current_user_languages, 1) >= 1 THEN 5
          ELSE 0
        END +
        CASE 
          WHEN ('hiring' = ANY(current_user_available_for) AND 'job_seeking' = ANY(COALESCE(p.available_for, ARRAY[]::TEXT[])))
            OR ('job_seeking' = ANY(current_user_available_for) AND 'hiring' = ANY(COALESCE(p.available_for, ARRAY[]::TEXT[])))
          THEN 8
          ELSE 0
        END +
        CASE 
          WHEN ('mentoring' = ANY(current_user_available_for) AND 'being_mentored' = ANY(COALESCE(p.available_for, ARRAY[]::TEXT[])))
            OR ('being_mentored' = ANY(current_user_available_for) AND 'mentoring' = ANY(COALESCE(p.available_for, ARRAY[]::TEXT[])))
          THEN 7
          ELSE 0
        END +
        CASE 
          WHEN array_length(p.focus_areas, 1) >= 2 
            AND array_length(p.skills, 1) >= 3 
            AND p.headline IS NOT NULL 
            AND p.bio IS NOT NULL 
          THEN 5
          ELSE 0
        END
      )))
    ) DESC,
    p.updated_at DESC NULLS LAST
  LIMIT p_limit OFFSET p_offset;
END;
$$;