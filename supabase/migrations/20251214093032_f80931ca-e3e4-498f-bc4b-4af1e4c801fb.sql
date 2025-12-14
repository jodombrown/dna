-- Fix rpc_get_profile_bundle to include all diaspora connection fields
CREATE OR REPLACE FUNCTION rpc_get_profile_bundle(p_username text, p_viewer_id uuid DEFAULT NULL)
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
      'profession', v_profile.profession,
      'company', v_profile.company,
      'current_country', v_profile.current_country,
      'current_city', v_profile.current_city,
      'country_of_origin', v_profile.country_of_origin,
      'languages', v_profile.languages,
      'verification_status', v_profile.verification_status,
      'created_at', v_profile.created_at,
      -- Add diaspora connection fields
      'diaspora_status', v_profile.diaspora_status,
      'ethnic_heritage', COALESCE(v_profile.ethnic_heritage, ARRAY[]::text[]),
      'african_causes', COALESCE(v_profile.african_causes, ARRAY[]::text[]),
      'engagement_intentions', COALESCE(v_profile.engagement_intentions, ARRAY[]::text[]),
      'return_intentions', v_profile.return_intentions,
      'africa_visit_frequency', v_profile.africa_visit_frequency,
      'diaspora_networks', COALESCE(v_profile.diaspora_networks, ARRAY[]::text[]),
      'mentorship_areas', COALESCE(v_profile.mentorship_areas, ARRAY[]::text[])
    ),
    'tags', json_build_object(
      -- Primary array fields (used by profile view components)
      'skills', COALESCE(v_profile.skills, ARRAY[]::text[]),
      'interests', COALESCE(v_profile.interests, ARRAY[]::text[]),
      'available_for', COALESCE(v_profile.available_for, ARRAY[]::text[]),
      'impact_areas', COALESCE(v_profile.impact_areas, ARRAY[]::text[]),
      -- Additional discovery tags
      'focus_areas', COALESCE(v_profile.focus_areas, ARRAY[]::text[]),
      'regional_expertise', COALESCE(v_profile.regional_expertise, ARRAY[]::text[]),
      'industries', COALESCE(v_profile.industries, ARRAY[]::text[]),
      'professional_sectors', COALESCE(v_profile.professional_sectors, ARRAY[]::text[]),
      'mentorship_areas', COALESCE(v_profile.mentorship_areas, ARRAY[]::text[]),
      'diaspora_networks', COALESCE(v_profile.diaspora_networks, ARRAY[]::text[]),
      -- Legacy tag fields for backward compatibility
      'skill_tags', COALESCE(v_profile.skill_tags, '[]'::jsonb),
      'interest_tags', to_jsonb(COALESCE(v_profile.interest_tags, ARRAY[]::text[])),
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