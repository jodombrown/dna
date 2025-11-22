-- Fix final 6 functions missing search_path

-- 1. create_entity_feed_post (with actual signature from database)
DROP FUNCTION IF EXISTS create_entity_feed_post(TEXT, UUID, UUID, TEXT, UUID, UUID);
CREATE FUNCTION create_entity_feed_post(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_author_id UUID,
  p_content TEXT,
  p_space_id UUID,
  p_event_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id UUID;
BEGIN
  INSERT INTO posts (author_id, content, linked_entity_type, linked_entity_id, space_id, event_id)
  VALUES (p_author_id, p_content, p_entity_type, p_entity_id, p_space_id, p_event_id)
  RETURNING id INTO v_post_id;
  
  RETURN v_post_id;
END;
$$;

-- 2. get_engine_loop_metrics (with date parameters)
DROP FUNCTION IF EXISTS get_engine_loop_metrics(TIMESTAMPTZ, TIMESTAMPTZ);
CREATE FUNCTION get_engine_loop_metrics(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
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
    'unique_users', COUNT(DISTINCT user_id),
    'avg_transitions_per_user', ROUND(COUNT(*)::NUMERIC / NULLIF(COUNT(DISTINCT user_id), 0), 2)
  ) INTO result
  FROM user_last_view_state
  WHERE last_visited_at BETWEEN p_start_date AND p_end_date;

  RETURN result;
END;
$$;

-- 3. get_organizer_analytics (with days_back parameter)
DROP FUNCTION IF EXISTS get_organizer_analytics(UUID, INTEGER);
CREATE FUNCTION get_organizer_analytics(
  p_organizer_id UUID,
  p_days_back INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  v_cutoff_date TIMESTAMPTZ;
BEGIN
  v_cutoff_date := NOW() - (p_days_back || ' days')::INTERVAL;
  
  SELECT json_build_object(
    'total_events', COUNT(*),
    'upcoming_events', COUNT(*) FILTER (WHERE start_time > NOW()),
    'past_events', COUNT(*) FILTER (WHERE start_time <= NOW()),
    'recent_events', COUNT(*) FILTER (WHERE created_at >= v_cutoff_date)
  ) INTO result
  FROM events
  WHERE organizer_id = p_organizer_id;

  RETURN result;
END;
$$;

-- 4. get_top_cross_transitions (with date parameters)
DROP FUNCTION IF EXISTS get_top_cross_transitions(INTEGER, TIMESTAMPTZ, TIMESTAMPTZ);
CREATE FUNCTION get_top_cross_transitions(
  p_limit INTEGER,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
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
    WHERE last_visited_at BETWEEN p_start_date AND p_end_date
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

-- 5. get_top_transition_entities (with date parameters)
DROP FUNCTION IF EXISTS get_top_transition_entities(TEXT, INTEGER, TIMESTAMPTZ, TIMESTAMPTZ);
CREATE FUNCTION get_top_transition_entities(
  p_entity_type TEXT,
  p_limit INTEGER,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE(entity_type TEXT, entity_id UUID, transition_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_entity_type::TEXT,
    gen_random_uuid(),
    0::BIGINT
  LIMIT 0;
END;
$$;

-- 6. get_view_state_distribution (with date parameters)
DROP FUNCTION IF EXISTS get_view_state_distribution(TIMESTAMPTZ, TIMESTAMPTZ);
CREATE FUNCTION get_view_state_distribution(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
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
  WHERE last_visited_at BETWEEN p_start_date AND p_end_date
  GROUP BY last_view_state
  ORDER BY COUNT(*) DESC;
END;
$$;