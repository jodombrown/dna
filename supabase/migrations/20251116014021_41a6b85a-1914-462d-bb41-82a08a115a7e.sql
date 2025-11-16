-- ADA Phase 2 M3: Telemetry & Insights

-- Create dashboard_analytics table for tracking engine events
CREATE TABLE IF NOT EXISTS dashboard_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  user_role text,
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_id text,
  route text
);

-- Enable RLS
ALTER TABLE dashboard_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all analytics"
  ON dashboard_analytics FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert analytics events"
  ON dashboard_analytics FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_dashboard_analytics_created_at ON dashboard_analytics(created_at DESC);
CREATE INDEX idx_dashboard_analytics_event_type ON dashboard_analytics(event_type);
CREATE INDEX idx_dashboard_analytics_user_id ON dashboard_analytics(user_id);
CREATE INDEX idx_dashboard_analytics_event_data ON dashboard_analytics USING gin(event_data);

-- Function to get view state distribution
CREATE OR REPLACE FUNCTION get_view_state_distribution(
  p_start_date timestamp with time zone DEFAULT now() - interval '30 days',
  p_end_date timestamp with time zone DEFAULT now()
)
RETURNS TABLE(
  view_state text,
  count bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    event_data->>'to_state' as view_state,
    COUNT(*) as count
  FROM dashboard_analytics
  WHERE event_type = 'view_state_change'
    AND created_at BETWEEN p_start_date AND p_end_date
    AND event_data->>'to_state' IS NOT NULL
  GROUP BY event_data->>'to_state'
  ORDER BY count DESC;
$$;

-- Function to get top cross-5C transitions
CREATE OR REPLACE FUNCTION get_top_cross_transitions(
  p_limit integer DEFAULT 10,
  p_start_date timestamp with time zone DEFAULT now() - interval '30 days',
  p_end_date timestamp with time zone DEFAULT now()
)
RETURNS TABLE(
  from_pillar text,
  to_pillar text,
  count bigint,
  entity_type text
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    event_data->>'from_pillar' as from_pillar,
    event_data->>'to_pillar' as to_pillar,
    COUNT(*) as count,
    event_data->>'entity_type' as entity_type
  FROM dashboard_analytics
  WHERE event_type = 'cross_5c_action_click'
    AND created_at BETWEEN p_start_date AND p_end_date
  GROUP BY 
    event_data->>'from_pillar',
    event_data->>'to_pillar',
    event_data->>'entity_type'
  ORDER BY count DESC
  LIMIT p_limit;
$$;

-- Function to get top entities driving transitions
CREATE OR REPLACE FUNCTION get_top_transition_entities(
  p_entity_type text,
  p_limit integer DEFAULT 10,
  p_start_date timestamp with time zone DEFAULT now() - interval '30 days',
  p_end_date timestamp with time zone DEFAULT now()
)
RETURNS TABLE(
  entity_id text,
  transition_count bigint,
  to_pillar text
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    event_data->>'entity_id' as entity_id,
    COUNT(*) as transition_count,
    event_data->>'to_pillar' as to_pillar
  FROM dashboard_analytics
  WHERE event_type = 'cross_5c_action_click'
    AND event_data->>'entity_type' = p_entity_type
    AND created_at BETWEEN p_start_date AND p_end_date
  GROUP BY 
    event_data->>'entity_id',
    event_data->>'to_pillar'
  ORDER BY transition_count DESC
  LIMIT p_limit;
$$;

-- Function to calculate engine loop completion rates
CREATE OR REPLACE FUNCTION get_engine_loop_metrics(
  p_start_date timestamp with time zone DEFAULT now() - interval '30 days',
  p_end_date timestamp with time zone DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_result jsonb;
  v_total_users bigint;
  v_event_to_space bigint;
  v_space_to_need bigint;
  v_need_to_contribution bigint;
BEGIN
  -- Count distinct users in the period
  SELECT COUNT(DISTINCT user_id) INTO v_total_users
  FROM dashboard_analytics
  WHERE created_at BETWEEN p_start_date AND p_end_date;

  -- Event → Space join
  SELECT COUNT(DISTINCT user_id) INTO v_event_to_space
  FROM dashboard_analytics
  WHERE event_type = 'cross_5c_action_click'
    AND event_data->>'from_pillar' = 'convene'
    AND event_data->>'to_pillar' = 'collaborate'
    AND created_at BETWEEN p_start_date AND p_end_date;

  -- Space → Need posted
  SELECT COUNT(DISTINCT user_id) INTO v_space_to_need
  FROM dashboard_analytics
  WHERE event_type = 'cross_5c_action_click'
    AND event_data->>'from_pillar' = 'collaborate'
    AND event_data->>'to_pillar' = 'contribute'
    AND created_at BETWEEN p_start_date AND p_end_date;

  -- Need → Contribution (offer help)
  SELECT COUNT(DISTINCT user_id) INTO v_need_to_contribution
  FROM dashboard_analytics
  WHERE event_type = 'detail_view_open'
    AND event_data->>'entity_type' = 'need'
    AND created_at BETWEEN p_start_date AND p_end_date;

  v_result := jsonb_build_object(
    'total_users', v_total_users,
    'event_to_space', jsonb_build_object(
      'count', v_event_to_space,
      'percentage', CASE WHEN v_total_users > 0 THEN (v_event_to_space::float / v_total_users * 100)::numeric(5,2) ELSE 0 END
    ),
    'space_to_need', jsonb_build_object(
      'count', v_space_to_need,
      'percentage', CASE WHEN v_total_users > 0 THEN (v_space_to_need::float / v_total_users * 100)::numeric(5,2) ELSE 0 END
    ),
    'need_to_contribution', jsonb_build_object(
      'count', v_need_to_contribution,
      'percentage', CASE WHEN v_total_users > 0 THEN (v_need_to_contribution::float / v_total_users * 100)::numeric(5,2) ELSE 0 END
    )
  );

  RETURN v_result;
END;
$$;