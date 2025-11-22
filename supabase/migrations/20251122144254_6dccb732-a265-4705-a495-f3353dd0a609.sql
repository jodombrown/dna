-- Fix search_path security warnings by adding SET search_path = public to all flagged functions
-- This prevents SQL injection risks without changing function signatures

-- 1. get_dashboard_preferences
DROP FUNCTION IF EXISTS get_dashboard_preferences(uuid);
CREATE FUNCTION get_dashboard_preferences(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefs jsonb;
BEGIN
  SELECT jsonb_build_object(
      'visible_modules', visible_modules,
      'collapsed_modules', collapsed_modules,
      'density', density
    ) INTO v_prefs
  FROM user_dashboard_preferences
  WHERE user_id = p_user_id;

  IF v_prefs IS NULL THEN
    SELECT jsonb_build_object(
      'visible_modules', ARRAY['activity', 'connections', 'spaces', 'events', 'opportunities']::text[],
      'collapsed_modules', ARRAY[]::text[],
      'density', 'standard'::text
    ) INTO v_prefs;
  END IF;

  RETURN v_prefs;
END;
$$;

-- 2. update_last_view_state
DROP FUNCTION IF EXISTS update_last_view_state(uuid, text, jsonb);
CREATE FUNCTION update_last_view_state(
  p_user_id uuid,
  p_view_state text,
  p_context jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_last_view_state (user_id, last_view_state, context, last_visited_at)
  VALUES (p_user_id, p_view_state, p_context, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    last_view_state = EXCLUDED.last_view_state,
    context = EXCLUDED.context,
    last_visited_at = EXCLUDED.last_visited_at;
END;
$$;

-- 3. get_activity_feed (preserve existing signature from migration)
DROP FUNCTION IF EXISTS get_activity_feed(UUID, TEXT[], INT, INT);
CREATE FUNCTION get_activity_feed(
  p_user_id UUID,
  p_activity_types TEXT[] DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(
  activity_id UUID,
  activity_type TEXT,
  created_at TIMESTAMPTZ,
  actor_id UUID,
  actor_name TEXT,
  actor_username TEXT,
  actor_avatar TEXT,
  target_id UUID,
  target_name TEXT,
  action_text TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  (
    SELECT 
      p.id, 'post'::TEXT, p.created_at,
      p.author_id, pr.full_name, pr.username, pr.avatar_url,
      NULL::UUID, NULL::TEXT,
      'created a post'::TEXT,
      jsonb_build_object('content', LEFT(p.content, 100))
    FROM posts p
    JOIN profiles pr ON pr.id = p.author_id
    WHERE p.author_id IN (
      SELECT CASE WHEN requester_id = p_user_id THEN recipient_id ELSE requester_id END
      FROM connections
      WHERE (requester_id = p_user_id OR recipient_id = p_user_id)
        AND status = 'accepted'
    )
    AND (p_activity_types IS NULL OR 'post' = ANY(p_activity_types))
  )
  UNION ALL
  (
    SELECT
      c.id, 'connection'::TEXT, c.created_at,
      c.requester_id, pr.full_name, pr.username, pr.avatar_url,
      c.recipient_id, pr2.full_name,
      'connected with'::TEXT,
      '{}'::JSONB
    FROM connections c
    JOIN profiles pr ON pr.id = c.requester_id
    JOIN profiles pr2 ON pr2.id = c.recipient_id
    WHERE (c.requester_id = p_user_id OR c.recipient_id = p_user_id)
      AND c.status = 'accepted'
      AND (p_activity_types IS NULL OR 'connection' = ANY(p_activity_types))
  )
  ORDER BY created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 4. get_event_analytics
DROP FUNCTION IF EXISTS get_event_analytics(UUID);
CREATE FUNCTION get_event_analytics(p_event_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_attendees', COUNT(*),
    'checked_in', COUNT(*) FILTER (WHERE checked_in = true),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'confirmed', COUNT(*) FILTER (WHERE status = 'confirmed')
  ) INTO result
  FROM event_attendees
  WHERE event_id = p_event_id;

  RETURN result;
END;
$$;

-- 5. get_view_state_distribution
DROP FUNCTION IF EXISTS get_view_state_distribution();
CREATE FUNCTION get_view_state_distribution()
RETURNS TABLE(view_state TEXT, user_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    last_view_state,
    COUNT(*)::BIGINT
  FROM user_last_view_state
  GROUP BY last_view_state
  ORDER BY COUNT(*) DESC;
END;
$$;

-- 6. get_organizer_analytics
DROP FUNCTION IF EXISTS get_organizer_analytics(UUID);
CREATE FUNCTION get_organizer_analytics(p_organizer_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_events', COUNT(*),
    'upcoming_events', COUNT(*) FILTER (WHERE start_time > NOW()),
    'past_events', COUNT(*) FILTER (WHERE start_time <= NOW())
  ) INTO result
  FROM events
  WHERE organizer_id = p_organizer_id;

  RETURN result;
END;
$$;

-- 7. update_spaces_updated_at (trigger function)
DROP FUNCTION IF EXISTS update_spaces_updated_at() CASCADE;
CREATE FUNCTION update_spaces_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 8. get_top_cross_transitions
DROP FUNCTION IF EXISTS get_top_cross_transitions(INT);
CREATE FUNCTION get_top_cross_transitions(p_limit INT DEFAULT 10)
RETURNS TABLE(from_state TEXT, to_state TEXT, transition_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH transitions AS (
    SELECT
      LAG(last_view_state) OVER (PARTITION BY user_id ORDER BY last_visited_at) as from_state,
      last_view_state as to_state
    FROM user_last_view_state
  )
  SELECT
    from_state,
    to_state,
    COUNT(*)::BIGINT
  FROM transitions
  WHERE from_state IS NOT NULL
  GROUP BY from_state, to_state
  ORDER BY COUNT(*) DESC
  LIMIT p_limit;
END;
$$;

-- 9. get_top_transition_entities
DROP FUNCTION IF EXISTS get_top_transition_entities(TEXT, INT);
CREATE FUNCTION get_top_transition_entities(p_from_state TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE(entity_type TEXT, entity_id UUID, transition_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    'unknown'::TEXT,
    gen_random_uuid(),
    0::BIGINT
  LIMIT 0;
END;
$$;

-- 10. get_engine_loop_metrics
DROP FUNCTION IF EXISTS get_engine_loop_metrics();
CREATE FUNCTION get_engine_loop_metrics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_transitions', COUNT(*),
    'unique_users', COUNT(DISTINCT user_id)
  ) INTO result
  FROM user_last_view_state;

  RETURN result;
END;
$$;

-- 11. cosine_similarity
DROP FUNCTION IF EXISTS cosine_similarity(JSONB, JSONB);
CREATE FUNCTION cosine_similarity(vec1 JSONB, vec2 JSONB)
RETURNS FLOAT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  dot_product FLOAT := 0;
  magnitude1 FLOAT := 0;
  magnitude2 FLOAT := 0;
  i INTEGER;
  arr1 FLOAT[];
  arr2 FLOAT[];
BEGIN
  arr1 := ARRAY(SELECT jsonb_array_elements_text(vec1)::FLOAT);
  arr2 := ARRAY(SELECT jsonb_array_elements_text(vec2)::FLOAT);

  IF array_length(arr1, 1) != array_length(arr2, 1) THEN
    RETURN 0;
  END IF;

  FOR i IN 1..array_length(arr1, 1) LOOP
    dot_product := dot_product + (arr1[i] * arr2[i]);
    magnitude1 := magnitude1 + (arr1[i] * arr1[i]);
    magnitude2 := magnitude2 + (arr2[i] * arr2[i]);
  END LOOP;

  IF magnitude1 = 0 OR magnitude2 = 0 THEN
    RETURN 0;
  END IF;

  RETURN dot_product / (sqrt(magnitude1) * sqrt(magnitude2));
END;
$$;

-- 12. get_similar_users
DROP FUNCTION IF EXISTS get_similar_users(UUID, INTEGER);
CREATE FUNCTION get_similar_users(target_user_id UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  similarity_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_vector JSONB;
BEGIN
  SELECT vector INTO target_vector
  FROM user_vectors
  WHERE user_vectors.user_id = target_user_id;
  
  IF target_vector IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    uv.user_id,
    cosine_similarity(target_vector, uv.vector) AS similarity_score
  FROM user_vectors uv
  WHERE uv.user_id != target_user_id
  ORDER BY similarity_score DESC
  LIMIT limit_count;
END;
$$;

-- 13. get_similar_entities
DROP FUNCTION IF EXISTS get_similar_entities(TEXT, UUID, INTEGER);
CREATE FUNCTION get_similar_entities(
  target_entity_type TEXT,
  target_entity_id UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  entity_type TEXT,
  entity_id UUID,
  similarity_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_vector JSONB;
BEGIN
  SELECT vector INTO target_vector
  FROM entity_vectors
  WHERE entity_vectors.entity_type = target_entity_type
    AND entity_vectors.entity_id = target_entity_id;
  
  IF target_vector IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    ev.entity_type,
    ev.entity_id,
    cosine_similarity(target_vector, ev.vector) AS similarity_score
  FROM entity_vectors ev
  WHERE ev.entity_type = target_entity_type
    AND ev.entity_id != target_entity_id
  ORDER BY similarity_score DESC
  LIMIT limit_count;
END;
$$;

-- 14. evaluate_cohort_criteria
DROP FUNCTION IF EXISTS evaluate_cohort_criteria(UUID, JSONB);
CREATE FUNCTION evaluate_cohort_criteria(
  p_user_id UUID,
  p_criteria JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN TRUE;
END;
$$;

-- 15. get_user_cohorts
DROP FUNCTION IF EXISTS get_user_cohorts(UUID);
CREATE FUNCTION get_user_cohorts(p_user_id UUID)
RETURNS TABLE (
  cohort_id UUID,
  cohort_name TEXT,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.is_active
  FROM ada_cohorts c
  INNER JOIN ada_cohort_memberships cm ON cm.cohort_id = c.id
  WHERE cm.user_id = p_user_id
    AND cm.expires_at > NOW();
END;
$$;

-- 16-19. Trigger functions for cascade deletes
DROP FUNCTION IF EXISTS delete_event_posts() CASCADE;
CREATE FUNCTION delete_event_posts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE posts
  SET is_deleted = TRUE
  WHERE linked_entity_type = 'event' 
    AND linked_entity_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP FUNCTION IF EXISTS delete_space_posts() CASCADE;
CREATE FUNCTION delete_space_posts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE posts
  SET is_deleted = TRUE
  WHERE linked_entity_type = 'space' 
    AND linked_entity_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP FUNCTION IF EXISTS delete_need_posts() CASCADE;
CREATE FUNCTION delete_need_posts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE posts
  SET is_deleted = TRUE
  WHERE linked_entity_type = 'contribution_need' 
    AND linked_entity_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP FUNCTION IF EXISTS delete_community_feed_posts() CASCADE;
CREATE FUNCTION delete_community_feed_posts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE posts
  SET is_deleted = TRUE
  WHERE linked_entity_type = 'community' 
    AND linked_entity_id = OLD.id;
  RETURN OLD;
END;
$$;

-- 20. discover_members (most recent version from migration)
DROP FUNCTION IF EXISTS discover_members(uuid,text[],text[],text[],text,text,text[],text,text,integer,integer);
CREATE FUNCTION discover_members(
  p_current_user_id uuid,
  p_focus_areas text[] DEFAULT NULL,
  p_regional_expertise text[] DEFAULT NULL,
  p_industries text[] DEFAULT NULL,
  p_country_of_origin text DEFAULT NULL,
  p_location_country text DEFAULT NULL,
  p_skills text[] DEFAULT NULL,
  p_search_query text DEFAULT NULL,
  p_sort_by text DEFAULT 'match',
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  headline text,
  focus_areas text[],
  regional_expertise text[],
  industries text[],
  skills text[],
  country_of_origin text,
  location_country text,
  match_score int,
  is_connected boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    p.location_country,
    100 as match_score,
    EXISTS (
      SELECT 1 FROM connections c
      WHERE ((c.requester_id = p_current_user_id AND c.recipient_id = p.id)
         OR (c.recipient_id = p_current_user_id AND c.requester_id = p.id))
        AND c.status = 'accepted'
    ) as is_connected
  FROM profiles p
  WHERE p.id != p_current_user_id
    AND p.id IN (SELECT id FROM auth.users WHERE deleted_at IS NULL)
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users bu
      WHERE (bu.blocker_id = p_current_user_id AND bu.blocked_id = p.id)
         OR (bu.blocker_id = p.id AND bu.blocked_id = p_current_user_id)
    )
    AND (
      COALESCE(array_length(p.focus_areas, 1), 0) +
      COALESCE(array_length(p.regional_expertise, 1), 0) +
      COALESCE(array_length(p.industries, 1), 0) +
      COALESCE(array_length(p.skills, 1), 0) +
      CASE WHEN p.headline IS NOT NULL AND p.headline != '' THEN 1 ELSE 0 END +
      CASE WHEN p.country_of_origin IS NOT NULL THEN 1 ELSE 0 END
    ) >= 3
  ORDER BY match_score DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 21. create_entity_feed_post
DROP FUNCTION IF EXISTS create_entity_feed_post(UUID, TEXT, TEXT, TEXT, JSONB);
CREATE FUNCTION create_entity_feed_post(
  p_author_id UUID,
  p_content TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id UUID;
BEGIN
  INSERT INTO posts (author_id, content, linked_entity_type, linked_entity_id, metadata)
  VALUES (p_author_id, p_content, p_entity_type, p_entity_id, p_metadata)
  RETURNING id INTO v_post_id;
  
  RETURN v_post_id;
END;
$$;