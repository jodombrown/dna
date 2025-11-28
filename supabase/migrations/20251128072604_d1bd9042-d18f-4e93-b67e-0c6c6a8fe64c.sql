-- Create rpc_get_profile_bundle function for Profile v2
-- Returns complete profile data with owner/public visibility applied

CREATE OR REPLACE FUNCTION rpc_get_profile_bundle(
  p_username TEXT,
  p_viewer_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_is_owner BOOLEAN;
  v_result JSON;
  v_activity_spaces JSON;
  v_activity_events JSON;
  v_connections_count INTEGER;
BEGIN
  -- Find profile by username (case-insensitive)
  SELECT * INTO v_profile
  FROM profiles
  WHERE LOWER(username) = LOWER(p_username)
  LIMIT 1;
  
  -- Return null if profile not found
  IF v_profile.id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Determine if viewer is owner
  v_is_owner := (p_viewer_id IS NOT NULL AND p_viewer_id = v_profile.id);
  
  -- Get activity counts (lightweight for now)
  SELECT COALESCE(json_agg(json_build_object(
    'id', s.id,
    'title', s.title,
    'role', CASE 
      WHEN s.created_by = v_profile.id THEN 'creator'
      ELSE 'member'
    END
  )), '[]'::json)
  INTO v_activity_spaces
  FROM collaboration_spaces s
  JOIN collaboration_memberships m ON m.space_id = s.id
  WHERE m.user_id = v_profile.id
    AND m.status = 'active'
  LIMIT 3;
  
  -- Get events (lightweight preview)
  SELECT COALESCE(json_agg(json_build_object(
    'id', e.id,
    'title', e.title,
    'role', CASE 
      WHEN e.creator_id = v_profile.id THEN 'host'
      ELSE 'attendee'
    END,
    'event_date', e.event_date
  )), '[]'::json)
  INTO v_activity_events
  FROM events e
  JOIN event_rsvps r ON r.event_id = e.id
  WHERE r.user_id = v_profile.id
    AND e.event_date >= CURRENT_DATE - INTERVAL '3 months'
  LIMIT 3;
  
  -- Get connection count
  SELECT COUNT(*) INTO v_connections_count
  FROM connections
  WHERE (requester_id = v_profile.id OR recipient_id = v_profile.id)
    AND status = 'accepted';
  
  -- Build result with visibility rules
  SELECT json_build_object(
    'profile', json_build_object(
      'user_id', v_profile.id,
      'username', v_profile.username,
      'full_name', v_profile.full_name,
      'headline', v_profile.headline,
      'professional_role', v_profile.professional_role,
      'company', v_profile.company,
      'avatar_url', v_profile.avatar_url,
      'banner_url', v_profile.banner_url,
      'current_country', v_profile.current_country,
      'location', v_profile.location,
      'country_of_origin', v_profile.country_of_origin,
      'diaspora_origin', v_profile.diaspora_origin,
      'bio', CASE 
        WHEN v_is_owner OR (v_profile.profile_visibility_settings->>'about' = 'public') 
        THEN v_profile.bio 
        ELSE NULL 
      END,
      'profession', v_profile.profession,
      'industry', v_profile.industry,
      'years_experience', v_profile.years_experience,
      'verification_status', v_profile.verification_status,
      'verification_updated_at', v_profile.verification_updated_at
    ),
    'tags', json_build_object(
      'skills', CASE 
        WHEN v_is_owner OR (v_profile.profile_visibility_settings->>'skills' = 'public')
        THEN v_profile.skills 
        ELSE '[]'::json 
      END,
      'interests', CASE 
        WHEN v_is_owner OR (v_profile.profile_visibility_settings->>'interests' = 'public')
        THEN v_profile.interests 
        ELSE '[]'::json 
      END,
      'impact_areas', v_profile.impact_areas,
      'available_for', v_profile.available_for,
      'diaspora_tags', v_profile.diaspora_tags,
      'region_tags', v_profile.region_tags,
      'skill_tags', v_profile.skill_tags,
      'contribution_tags', v_profile.contribution_tags,
      'interest_tags', v_profile.interest_tags
    ),
    'activity', json_build_object(
      'spaces', v_activity_spaces,
      'events', v_activity_events,
      'connections_count', v_connections_count
    ),
    'permissions', json_build_object(
      'is_owner', v_is_owner,
      'can_edit', v_is_owner,
      'can_create_events', v_profile.verification_status IN ('soft_verified', 'fully_verified'),
      'can_create_public_spaces', v_profile.verification_status = 'fully_verified',
      'can_connect', NOT v_is_owner
    ),
    'visibility', v_profile.profile_visibility_settings,
    'completion', json_build_object(
      'score', v_profile.profile_completion_score,
      'suggested_actions', CASE 
        WHEN v_is_owner THEN
          CASE 
            WHEN v_profile.profile_completion_score < 100 THEN
              json_build_array(
                CASE WHEN v_profile.bio IS NULL OR LENGTH(v_profile.bio) < 50 
                  THEN 'add_bio' ELSE NULL END,
                CASE WHEN COALESCE(array_length(v_profile.skills, 1), 0) < 3 
                  THEN 'add_skills' ELSE NULL END,
                CASE WHEN COALESCE(array_length(v_profile.interests, 1), 0) < 3 
                  THEN 'add_interests' ELSE NULL END,
                CASE WHEN v_profile.country_of_origin IS NULL 
                  THEN 'add_diaspora_story' ELSE NULL END
              )
            ELSE '[]'::json 
          END
        ELSE '[]'::json
      END
    ),
    'verification_meta', json_build_object(
      'tier', v_profile.verification_status,
      'updated_at', v_profile.verification_updated_at,
      'improvement_suggestions', CASE 
        WHEN v_is_owner AND v_profile.verification_status = 'pending_verification' THEN
          json_build_array(
            'Complete your profile',
            'Participate in DNA activities',
            'Join spaces and events'
          )
        ELSE '[]'::json
      END
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;