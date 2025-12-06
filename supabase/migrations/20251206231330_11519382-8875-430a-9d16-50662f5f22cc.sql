-- Fix rpc_get_profile_bundle to use event_attendees instead of non-existent event_rsvps
CREATE OR REPLACE FUNCTION public.rpc_get_profile_bundle(p_username text, p_viewer_id uuid DEFAULT NULL)
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
BEGIN
  -- Find profile by username
  SELECT * INTO v_profile FROM profiles WHERE username = p_username;
  
  IF v_profile.id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Determine if viewer is owner
  v_is_owner := (p_viewer_id IS NOT NULL AND p_viewer_id = v_profile.id);
  
  -- Get spaces (via collaboration_memberships)
  SELECT COALESCE(json_agg(json_build_object(
    'id', s.id,
    'title', s.title,
    'role', cm.role
  )), '[]'::json)
  INTO v_spaces
  FROM collaboration_spaces s
  JOIN collaboration_memberships cm ON cm.space_id = s.id
  WHERE cm.user_id = v_profile.id AND cm.status = 'active'
  LIMIT 3;
  
  -- Get events (via event_attendees - the CORRECT table name)
  SELECT COALESCE(json_agg(json_build_object(
    'id', e.id,
    'title', e.title,
    'role', CASE 
      WHEN e.creator_id = v_profile.id THEN 'host'
      ELSE 'attendee'
    END,
    'event_date', e.event_date
  )), '[]'::json)
  INTO v_events
  FROM events e
  JOIN event_attendees ea ON ea.event_id = e.id
  WHERE ea.user_id = v_profile.id
    AND e.event_date >= CURRENT_DATE - INTERVAL '3 months'
  LIMIT 3;
  
  -- Build activity object
  v_activity := json_build_object(
    'spaces', v_spaces,
    'events', v_events,
    'stories_count', (SELECT COUNT(*) FROM posts WHERE author_id = v_profile.id AND post_type = 'story'),
    'contributions_count', 0
  );
  
  -- Build and return the full bundle
  v_result := json_build_object(
    'profile', json_build_object(
      'id', v_profile.id,
      'username', v_profile.username,
      'full_name', COALESCE(v_profile.first_name || ' ' || v_profile.last_name, v_profile.first_name, v_profile.full_name),
      'first_name', v_profile.first_name,
      'last_name', v_profile.last_name,
      'avatar_url', v_profile.avatar_url,
      'banner_url', v_profile.banner_url,
      'professional_role', v_profile.professional_role,
      'headline', v_profile.headline,
      'bio', v_profile.bio,
      'current_country', v_profile.current_country,
      'current_city', v_profile.current_city,
      'country_of_origin', v_profile.country_of_origin,
      'languages', v_profile.languages,
      'verification_status', v_profile.verification_status,
      'created_at', v_profile.created_at
    ),
    'tags', json_build_object(
      'skill_tags', COALESCE(v_profile.skill_tags, '[]'::jsonb),
      'interest_tags', COALESCE(v_profile.interest_tags, '[]'::jsonb),
      'contribution_tags', COALESCE(v_profile.contribution_tags, '[]'::jsonb),
      'sector_tags', COALESCE(v_profile.sector_tags, '[]'::jsonb),
      'diaspora_tags', COALESCE(v_profile.diaspora_tags, '[]'::jsonb),
      'region_tags', COALESCE(v_profile.region_tags, '[]'::jsonb),
      'language_tags', COALESCE(v_profile.language_tags, '[]'::jsonb)
    ),
    'activity', v_activity,
    'permissions', json_build_object(
      'is_owner', v_is_owner,
      'can_edit', v_is_owner,
      'can_create_events', v_profile.verification_status IN ('soft_verified', 'fully_verified'),
      'can_create_public_spaces', v_profile.verification_status = 'fully_verified'
    ),
    'visibility', json_build_object(
      'show_skills', true,
      'show_interests', true,
      'show_activity', true,
      'show_about', true
    ),
    'completion', json_build_object(
      'score', COALESCE(v_profile.profile_completion_score, 0),
      'suggested_actions', ARRAY[]::text[]
    ),
    'verification_meta', json_build_object(
      'status', v_profile.verification_status,
      'tier', CASE 
        WHEN v_profile.verification_status = 'fully_verified' THEN 'full'
        WHEN v_profile.verification_status = 'soft_verified' THEN 'soft'
        ELSE 'pending'
      END
    )
  );
  
  RETURN v_result;
END;
$$;