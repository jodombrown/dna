-- Drop and recreate discover_members with correct column name
DROP FUNCTION IF EXISTS discover_members(uuid,text[],text[],text[],text,text,text[],text,text,integer,integer);

CREATE FUNCTION discover_members(
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
  is_connected BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
    100 as match_score,
    EXISTS (
      SELECT 1 FROM connections c
      WHERE ((c.requester_id = p_current_user_id AND c.recipient_id = p.id)
         OR (c.recipient_id = p_current_user_id AND c.requester_id = p.id))
        AND c.status = 'accepted'
    ) as is_connected
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
    -- Apply country filters (use current_country, not location_country)
    AND (p_country_of_origin IS NULL OR p.country_of_origin ILIKE '%' || p_country_of_origin || '%')
    AND (p_location_country IS NULL OR p.current_country ILIKE '%' || p_location_country || '%')
  ORDER BY match_score DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;