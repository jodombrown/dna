-- =====================================================
-- FIX: Exclude Deleted/Orphaned Users from Discovery
-- =====================================================

-- Update discover_members to exclude users deleted from auth
CREATE OR REPLACE FUNCTION discover_members(
  p_current_user_id uuid,
  p_focus_areas text[] DEFAULT NULL,
  p_regional_expertise text[] DEFAULT NULL,
  p_industries text[] DEFAULT NULL,
  p_country_of_origin text DEFAULT NULL,
  p_location_country text DEFAULT NULL,
  p_search_query text DEFAULT NULL,
  p_sort_by text DEFAULT 'match',
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  full_name text,
  username text,
  avatar_url text,
  banner_url text,
  banner_type text,
  banner_gradient text,
  banner_overlay boolean,
  headline text,
  profession text,
  location text,
  country_of_origin text,
  focus_areas text[],
  regional_expertise text[],
  industries text[],
  profile_completion_percentage int,
  match_score int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH current_user_profile AS (
    SELECT 
      p.focus_areas as user_focus,
      p.regional_expertise as user_region,
      p.industries as user_industries,
      p.country_of_origin as user_country,
      p.location_country as user_location
    FROM profiles p
    WHERE p.id = p_current_user_id
  ),
  scored_profiles AS (
    SELECT
      p.*,
      (
        -- Shared focus areas (20 points max)
        CASE 
          WHEN p_focus_areas IS NULL THEN
            CASE 
              WHEN cardinality(p.focus_areas & (SELECT user_focus FROM current_user_profile)) >= 3 THEN 20
              WHEN cardinality(p.focus_areas & (SELECT user_focus FROM current_user_profile)) = 2 THEN 14
              WHEN cardinality(p.focus_areas & (SELECT user_focus FROM current_user_profile)) = 1 THEN 7
              ELSE 0
            END
          WHEN cardinality(p.focus_areas & p_focus_areas) >= 3 THEN 20
          WHEN cardinality(p.focus_areas & p_focus_areas) = 2 THEN 14
          WHEN cardinality(p.focus_areas & p_focus_areas) = 1 THEN 7
          ELSE 0
        END +
        
        -- Shared regional expertise (15 points max)
        CASE 
          WHEN p_regional_expertise IS NULL THEN
            CASE 
              WHEN cardinality(p.regional_expertise & (SELECT user_region FROM current_user_profile)) >= 2 THEN 15
              WHEN cardinality(p.regional_expertise & (SELECT user_region FROM current_user_profile)) = 1 THEN 8
              ELSE 0
            END
          WHEN cardinality(p.regional_expertise & p_regional_expertise) >= 2 THEN 15
          WHEN cardinality(p.regional_expertise & p_regional_expertise) = 1 THEN 8
          ELSE 0
        END +
        
        -- Shared industries (15 points max)
        CASE 
          WHEN p_industries IS NULL THEN
            CASE 
              WHEN cardinality(p.industries & (SELECT user_industries FROM current_user_profile)) >= 2 THEN 15
              WHEN cardinality(p.industries & (SELECT user_industries FROM current_user_profile)) = 1 THEN 8
              ELSE 0
            END
          WHEN cardinality(p.industries & p_industries) >= 2 THEN 15
          WHEN cardinality(p.industries & p_industries) = 1 THEN 8
          ELSE 0
        END +
        
        -- Same country of origin (20 points)
        CASE 
          WHEN p.country_of_origin = (SELECT user_country FROM current_user_profile) THEN 20
          ELSE 0
        END +
        
        -- Same location (10 points)
        CASE 
          WHEN p.location_country = (SELECT user_location FROM current_user_profile) THEN 10
          ELSE 0
        END +
        
        -- Profile completeness bonus (10 points)
        CASE 
          WHEN p.profile_completion_percentage >= 80 THEN 10
          ELSE 0
        END +
        
        -- Open to engage (10 points total)
        CASE WHEN p.open_to_mentor = true THEN 5 ELSE 0 END +
        CASE WHEN p.open_to_invest = true THEN 5 ELSE 0 END
      )::int AS match_score
      
    FROM profiles p
    INNER JOIN auth.users au ON au.id = p.id  -- Only include users with valid auth accounts
    WHERE
      p.id != p_current_user_id
      AND p.is_public = true
      AND (p_focus_areas IS NULL OR p.focus_areas && p_focus_areas)
      AND (p_regional_expertise IS NULL OR p.regional_expertise && p_regional_expertise)
      AND (p_industries IS NULL OR p.industries && p_industries)
      AND (p_country_of_origin IS NULL OR p.country_of_origin = p_country_of_origin)
      AND (p_location_country IS NULL OR p.location_country = p_location_country)
      AND (
        p_search_query IS NULL OR
        p.full_name ILIKE '%' || p_search_query || '%' OR
        p.headline ILIKE '%' || p_search_query || '%' OR
        p.username ILIKE '%' || p_search_query || '%' OR
        p.bio ILIKE '%' || p_search_query || '%'
      )
  )
  SELECT 
    sp.id,
    sp.full_name,
    sp.username,
    sp.avatar_url,
    sp.banner_url,
    sp.banner_type,
    sp.banner_gradient,
    sp.banner_overlay,
    sp.headline,
    sp.profession,
    sp.location,
    sp.country_of_origin,
    sp.focus_areas,
    sp.regional_expertise,
    sp.industries,
    sp.profile_completion_percentage,
    sp.match_score
  FROM scored_profiles sp
  WHERE sp.match_score >= 40
  ORDER BY 
    CASE 
      WHEN p_sort_by = 'match' THEN sp.match_score
      WHEN p_sort_by = 'completion' THEN sp.profile_completion_percentage
      ELSE 0
    END DESC,
    CASE 
      WHEN p_sort_by = 'recent' THEN sp.created_at
      ELSE NULL
    END DESC,
    CASE 
      WHEN p_sort_by = 'alphabetical' THEN sp.full_name
      ELSE NULL
    END ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- =====================================================
-- CLEANUP: Ensure CASCADE on profiles foreign key
-- =====================================================

-- Drop existing constraint if it exists
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Recreate with CASCADE to prevent orphaned records in future
ALTER TABLE profiles
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- =====================================================
-- DIAGNOSTIC: Function to find orphaned profiles
-- =====================================================

CREATE OR REPLACE FUNCTION find_orphaned_profiles()
RETURNS TABLE (
  profile_id uuid,
  username text,
  full_name text,
  created_at timestamptz,
  has_auth_user boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as profile_id,
    p.username,
    p.full_name,
    p.created_at,
    EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id) as has_auth_user
  FROM profiles p
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id)
  ORDER BY p.created_at DESC;
END;
$$;