-- Fix rpc_get_profile_bundle to include banner configuration fields
CREATE OR REPLACE FUNCTION public.rpc_get_profile_bundle(
  p_username text,
  p_viewer_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_result json;
  v_is_owner boolean;
  v_activity json;
  v_spaces json;
  v_events json;
  v_connections_count integer;
BEGIN
  -- Find profile by username
  SELECT * INTO v_profile FROM profiles WHERE username = p_username;
  
  IF v_profile.id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Determine if viewer is owner
  v_is_owner := (p_viewer_id IS NOT NULL AND p_viewer_id = v_profile.id);
  
  -- For non-owners, only allow access to public profiles
  IF NOT v_is_owner AND NOT COALESCE(v_profile.is_public, false) THEN
    RETURN NULL;
  END IF;
  
  -- Get connections count (accepted connections where user is requester or recipient)
  SELECT COUNT(*) INTO v_connections_count
  FROM connections
  WHERE status = 'accepted'
    AND (requester_id = v_profile.id OR recipient_id = v_profile.id);
  
  -- Get spaces (via collaboration_memberships)
  SELECT COALESCE(json_agg(space_data), '[]'::json)
  INTO v_spaces
  FROM (
    SELECT json_build_object(
      'id', s.id,
      'title', s.title,
      'role', cm.role
    ) as space_data
    FROM collaboration_spaces s
    JOIN collaboration_memberships cm ON cm.space_id = s.id
    WHERE cm.user_id = v_profile.id AND cm.status = 'active'
    LIMIT 3
  ) sub;
  
  -- Get events (via event_attendees)
  SELECT COALESCE(json_agg(event_data), '[]'::json)
  INTO v_events
  FROM (
    SELECT json_build_object(
      'id', e.id,
      'title', e.title,
      'role', CASE 
        WHEN e.organizer_id = v_profile.id THEN 'host'
        ELSE 'attendee'
      END,
      'event_date', e.start_time
    ) as event_data
    FROM events e
    JOIN event_attendees ea ON ea.event_id = e.id
    WHERE ea.user_id = v_profile.id
      AND e.start_time >= CURRENT_DATE - INTERVAL '3 months'
    LIMIT 3
  ) sub;
  
  -- Build activity object (now includes connections_count!)
  v_activity := json_build_object(
    'spaces', v_spaces,
    'events', v_events,
    'connections_count', v_connections_count,
    'stories_count', (SELECT COUNT(*) FROM posts WHERE author_id = v_profile.id AND post_type = 'story'),
    'contributions_count', 0
  );
  
  -- Build and return the full bundle with banner configuration fields
  v_result := json_build_object(
    'profile', json_build_object(
      'id', v_profile.id,
      'username', v_profile.username,
      'full_name', COALESCE(v_profile.first_name || ' ' || v_profile.last_name, v_profile.first_name, v_profile.full_name),
      'first_name', v_profile.first_name,
      'last_name', v_profile.last_name,
      'avatar_url', v_profile.avatar_url,
      'banner_url', v_profile.banner_url,
      'banner_type', COALESCE(v_profile.banner_type, 'gradient'),
      'banner_gradient', COALESCE(v_profile.banner_gradient, 'dna'),
      'banner_overlay', COALESCE(v_profile.banner_overlay, false),
      'professional_role', v_profile.professional_role,
      'headline', v_profile.headline,
      'bio', v_profile.bio,
      'profession', v_profile.profession,
      'company', v_profile.company,
      'current_country', v_profile.current_country,
      'current_city', v_profile.current_city,
      'country_of_origin', v_profile.country_of_origin,
      'languages', v_profile.languages,
      'verification_status', v_profile.verification_status,
      'created_at', v_profile.created_at,
      'is_public', COALESCE(v_profile.is_public, true),
      'allow_profile_sharing', COALESCE(v_profile.allow_profile_sharing, true),
      'diaspora_status', v_profile.diaspora_status,
      'diaspora_story', v_profile.diaspora_story,
      'ethnic_heritage', COALESCE(v_profile.ethnic_heritage, ARRAY[]::text[]),
      'african_causes', COALESCE(v_profile.african_causes, ARRAY[]::text[]),
      'engagement_intentions', COALESCE(v_profile.engagement_intentions, ARRAY[]::text[]),
      'return_intentions', v_profile.return_intentions,
      'africa_visit_frequency', v_profile.africa_visit_frequency,
      'diaspora_networks', COALESCE(v_profile.diaspora_networks, ARRAY[]::text[]),
      'mentorship_areas', COALESCE(v_profile.mentorship_areas, ARRAY[]::text[]),
      'skills', COALESCE(v_profile.skills, ARRAY[]::text[]),
      'focus_areas', COALESCE(v_profile.focus_areas, ARRAY[]::text[]),
      'interests', COALESCE(v_profile.interests, ARRAY[]::text[]),
      'industries', COALESCE(v_profile.industries, ARRAY[]::text[]),
      'regional_expertise', COALESCE(v_profile.regional_expertise, ARRAY[]::text[]),
      'available_for', COALESCE(v_profile.available_for, ARRAY[]::text[])
    ),
    'tags', json_build_object(
      'skills', COALESCE(v_profile.skills, ARRAY[]::text[]),
      'interests', COALESCE(v_profile.interests, ARRAY[]::text[]),
      'impact_areas', COALESCE(v_profile.focus_areas, ARRAY[]::text[]),
      'available_for', COALESCE(v_profile.available_for, ARRAY[]::text[]),
      'focus_areas', COALESCE(v_profile.focus_areas, ARRAY[]::text[]),
      'regional_expertise', COALESCE(v_profile.regional_expertise, ARRAY[]::text[]),
      'industries', COALESCE(v_profile.industries, ARRAY[]::text[])
    ),
    'activity', v_activity,
    'permissions', json_build_object(
      'is_owner', v_is_owner,
      'can_edit', v_is_owner,
      'can_create_events', v_is_owner,
      'can_create_public_spaces', v_is_owner,
      'can_connect', NOT v_is_owner AND p_viewer_id IS NOT NULL
    ),
    'visibility', json_build_object(
      'about', 'public',
      'skills', 'public',
      'contact', 'connections',
      'activity', 'public',
      'contributions', 'public'
    ),
    'isOwner', v_is_owner
  );
  
  RETURN v_result;
END;
$$;