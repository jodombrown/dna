-- =========================================
-- ADIN-lite Helper RPCs for Connection Nudges
-- =========================================

-- Function: Get users who need their first connection nudges
-- Returns users with 0 connections and account age >= 3 days
CREATE OR REPLACE FUNCTION get_users_needing_connection_nudges()
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  username TEXT,
  connections_count INT,
  account_age_days INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.full_name,
    p.username,
    COALESCE(
      (SELECT COUNT(*)::INT 
       FROM connections c 
       WHERE (c.requester_id = p.id OR c.recipient_id = p.id) 
       AND c.status = 'accepted'
      ), 0
    ) as connections_count,
    EXTRACT(DAY FROM (NOW() - p.created_at))::INT as account_age_days
  FROM profiles p
  WHERE p.created_at <= NOW() - INTERVAL '3 days'
    AND p.profile_completion_percentage >= 40
    AND NOT EXISTS (
      SELECT 1 FROM connections c 
      WHERE (c.requester_id = p.id OR c.recipient_id = p.id) 
      AND c.status = 'accepted'
    )
    -- Exclude users who already have a recent nudge
    AND NOT EXISTS (
      SELECT 1 FROM adin_nudges n
      WHERE n.user_id = p.id
      AND n.nudge_type = 'first_connections'
      AND n.created_at > NOW() - INTERVAL '7 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get inactive users for re-engagement
-- Returns users with last_seen_at older than 7 days
CREATE OR REPLACE FUNCTION get_inactive_users_for_reengagement(
  p_days_inactive INT DEFAULT 7
)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  username TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  days_inactive INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.full_name,
    p.username,
    p.last_seen_at,
    EXTRACT(DAY FROM (NOW() - p.last_seen_at))::INT as days_inactive
  FROM profiles p
  WHERE p.last_seen_at IS NOT NULL
    AND p.last_seen_at <= NOW() - MAKE_INTERVAL(days => p_days_inactive)
    AND p.profile_completion_percentage >= 40
    -- Exclude users who already have a recent re-engagement nudge
    AND NOT EXISTS (
      SELECT 1 FROM adin_nudges n
      WHERE n.user_id = p.id
      AND n.nudge_type = 'reengagement'
      AND n.created_at > NOW() - INTERVAL '14 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- Create analytics_events table
-- =========================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_metadata JSONB,
  route TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- =========================================
-- RLS Policies for Moderation & Analytics
-- =========================================

-- Enable RLS on content_flags if not already enabled
ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own reports (using flagged_by column)
DROP POLICY IF EXISTS "Users can report content" ON content_flags;
CREATE POLICY "Users can report content" ON content_flags
  FOR INSERT
  WITH CHECK (auth.uid() = flagged_by);

-- Only admins can view reports
DROP POLICY IF EXISTS "Admins can view all reports" ON content_flags;
CREATE POLICY "Admins can view all reports" ON content_flags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Only admins can update report status
DROP POLICY IF EXISTS "Admins can update reports" ON content_flags;
CREATE POLICY "Admins can update reports" ON content_flags
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Enable RLS on analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own analytics events
DROP POLICY IF EXISTS "Users can track their own events" ON analytics_events;
CREATE POLICY "Users can track their own events" ON analytics_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins can view analytics
DROP POLICY IF EXISTS "Admins can view analytics" ON analytics_events;
CREATE POLICY "Admins can view analytics" ON analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Grant execute permissions on ADIN functions to authenticated users
GRANT EXECUTE ON FUNCTION get_users_needing_connection_nudges() TO authenticated;
GRANT EXECUTE ON FUNCTION get_inactive_users_for_reengagement(INT) TO authenticated;