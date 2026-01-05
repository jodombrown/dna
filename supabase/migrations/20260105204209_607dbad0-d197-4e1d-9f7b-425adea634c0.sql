-- Fix COALESCE type mismatch in rpc_get_profile_bundle
-- text[] columns cannot be coalesced with jsonb, need to convert arrays to json

CREATE OR REPLACE FUNCTION public.rpc_get_profile_bundle(
  p_username text,
  p_viewer_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER
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
  v_connection_status text;
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
  
  -- Get connection status between viewer and profile owner
  v_connection_status := 'none';
  
  IF p_viewer_id IS NOT NULL AND NOT v_is_owner THEN
    SELECT 
      CASE 
        WHEN status = 'accepted' THEN 'accepted'
        WHEN status = 'pending' THEN 'pending_sent'
        WHEN status = 'declined' THEN 'declined'
        ELSE 'none'
      END INTO v_connection_status
    FROM connections
    WHERE requester_id = p_viewer_id AND recipient_id = v_profile.id;
    
    IF v_connection_status IS NULL OR v_connection_status = 'none' THEN
      SELECT 
        CASE 
          WHEN status = 'accepted' THEN 'accepted'
          WHEN status = 'pending' THEN 'pending_received'
          WHEN status = 'declined' THEN 'declined'
          ELSE 'none'
        END INTO v_connection_status
      FROM connections
      WHERE requester_id = v_profile.id AND recipient_id = p_viewer_id;
    END IF;
    
    v_connection_status := COALESCE(v_connection_status, 'none');
  END IF;
  
  -- Get connections count
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
  
  -- Get events where user is EITHER organizer OR attendee
  SELECT COALESCE(json_agg(event_data ORDER BY event_date DESC), '[]'::json)
  INTO v_events
  FROM (
    -- Events where user is the organizer
    SELECT DISTINCT ON (e.id)
      json_build_object(
        'id', e.id,
        'title', e.title,
        'role', 'host',
        'event_date', e.start_time
      ) as event_data,
      e.start_time as event_date
    FROM events e
    WHERE e.organizer_id = v_profile.id
      AND e.is_cancelled = false
      AND e.start_time >= CURRENT_DATE - INTERVAL '3 months'
    
    UNION ALL
    
    -- Events where user is an attendee (but not the organizer)
    SELECT DISTINCT ON (e.id)
      json_build_object(
        'id', e.id,
        'title', e.title,
        'role', 'attendee',
        'event_date', e.start_time
      ) as event_data,
      e.start_time as event_date
    FROM events e
    JOIN event_attendees ea ON ea.event_id = e.id
    WHERE ea.user_id = v_profile.id
      AND e.organizer_id != v_profile.id
      AND e.is_cancelled = false
      AND e.start_time >= CURRENT_DATE - INTERVAL '3 months'
    
    LIMIT 5
  ) sub;
  
  -- Build activity object
  v_activity := json_build_object(
    'spaces', v_spaces,
    'events', v_events,
    'connections_count', v_connections_count,
    'stories_count', (SELECT COUNT(*) FROM posts WHERE author_id = v_profile.id AND post_type = 'story'),
    'contributions_count', 0
  );
  
  -- Build and return the full bundle
  -- FIX: Use to_json() for text[] arrays instead of COALESCE with jsonb
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
      'industry', v_profile.industry,
      'years_experience', v_profile.years_experience,
      'current_country', v_profile.current_country,
      'current_city', v_profile.current_city,
      'country_of_origin', v_profile.country_of_origin,
      'diaspora_origin', v_profile.diaspora_origin,
      'diaspora_status', v_profile.diaspora_status,
      'ethnic_heritage', v_profile.ethnic_heritage,
      'african_causes', v_profile.african_causes,
      'engagement_intentions', v_profile.engagement_intentions,
      'return_intentions', v_profile.return_intentions,
      'africa_visit_frequency', v_profile.africa_visit_frequency,
      'diaspora_networks', v_profile.diaspora_networks,
      'mentorship_areas', v_profile.mentorship_areas,
      'languages', v_profile.languages,
      'location', v_profile.location,
      'verification_status', v_profile.verification_status,
      'verification_updated_at', v_profile.verification_updated_at,
      'created_at', v_profile.created_at
    ),
    'tags', json_build_object(
      'skills', COALESCE(to_json(v_profile.skills), '[]'::json),
      'interests', COALESCE(to_json(v_profile.interests), '[]'::json),
      'focus_areas', COALESCE(to_json(v_profile.focus_areas), '[]'::json),
      'impact_areas', COALESCE(to_json(v_profile.impact_areas), '[]'::json),
      'available_for', COALESCE(to_json(v_profile.available_for), '[]'::json),
      'industries', COALESCE(to_json(v_profile.industries), '[]'::json),
      'regional_expertise', COALESCE(to_json(v_profile.regional_expertise), '[]'::json),
      'professional_sectors', COALESCE(to_json(v_profile.professional_sectors), '[]'::json)
    ),
    'activity', v_activity,
    'permissions', json_build_object(
      'is_owner', v_is_owner,
      'can_edit', v_is_owner,
      'can_create_events', true,
      'can_create_public_spaces', true,
      'can_connect', NOT v_is_owner AND v_connection_status = 'none'
    ),
    'visibility', json_build_object(
      'about', 'public',
      'skills', 'public',
      'interests', 'public',
      'activity', 'public',
      'events', 'public',
      'spaces', 'public',
      'opportunities', 'public',
      'stories', 'public'
    ),
    'completion', json_build_object(
      'score', COALESCE(v_profile.profile_completion_percentage, 0),
      'suggested_actions', '[]'::json
    ),
    'verification_meta', json_build_object(
      'tier', v_profile.verification_status,
      'status', v_profile.verification_status,
      'updated_at', v_profile.verification_updated_at,
      'improvement_suggestions', '[]'::json
    ),
    'connection_status', v_connection_status
  );
  
  RETURN v_result;
END;
$$;