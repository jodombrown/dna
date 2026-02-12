-- ============================================================
-- DNA NOTIFICATION SYSTEM — Database Schema
-- Migration: 20260212400000_notification_system.sql
--
-- Creates the complete notification system tables:
-- 1. notification_records — Core notification storage
-- 2. notification_batches — Aggregated notification groups
-- 3. notification_preferences — Per-user notification settings
-- 4. badge_counts — Real-time per-module unread counts
-- 5. push_tokens — Device push notification tokens
-- 6. Helper functions for badge management
-- ============================================================

-- ============================================================
-- 1. NOTIFICATION RECORDS
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  c_module TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',

  -- Content
  headline TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  icon_type TEXT NOT NULL,

  -- Actor (who triggered this)
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT,
  actor_avatar_url TEXT,

  -- Target (what the notification is about)
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_title TEXT,

  -- Actions
  primary_action JSONB NOT NULL DEFAULT '{}',
  secondary_action JSONB,

  -- Cross-C context
  cross_c_context JSONB,

  -- Delivery
  channels TEXT[] NOT NULL DEFAULT '{}',
  delivered_via TEXT[] DEFAULT '{}',
  scheduled_for TIMESTAMPTZ,
  batch_id UUID,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'queued',
  dia_score FLOAT DEFAULT 0.5,
  dia_suppressed BOOLEAN DEFAULT FALSE,
  dia_suppression_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  seen_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  acted_on_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_notif_records_recipient
  ON notification_records(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notif_records_status
  ON notification_records(recipient_id, status);

CREATE INDEX IF NOT EXISTS idx_notif_records_unread
  ON notification_records(recipient_id, status)
  WHERE status = 'delivered';

CREATE INDEX IF NOT EXISTS idx_notif_records_type
  ON notification_records(type);

CREATE INDEX IF NOT EXISTS idx_notif_records_category
  ON notification_records(category, recipient_id);

CREATE INDEX IF NOT EXISTS idx_notif_records_c_module
  ON notification_records(c_module, recipient_id);

CREATE INDEX IF NOT EXISTS idx_notif_records_scheduled
  ON notification_records(scheduled_for)
  WHERE scheduled_for IS NOT NULL AND status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_notif_records_batch
  ON notification_records(batch_id)
  WHERE batch_id IS NOT NULL;

-- RLS
ALTER TABLE notification_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notification records"
  ON notification_records FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users update own notification records"
  ON notification_records FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Service role can insert notifications for any user
CREATE POLICY "Service role inserts notification records"
  ON notification_records FOR INSERT
  WITH CHECK (true);


-- ============================================================
-- 2. NOTIFICATION BATCHES
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_type TEXT NOT NULL,
  headline TEXT NOT NULL,
  item_count INTEGER NOT NULL DEFAULT 0,
  representative_actors JSONB DEFAULT '[]',
  c_module TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_title TEXT,
  primary_action JSONB NOT NULL DEFAULT '{}',
  child_notification_ids UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'delivered',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(recipient_id, batch_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_notif_batches_recipient
  ON notification_batches(recipient_id, created_at DESC);

ALTER TABLE notification_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notification batches"
  ON notification_batches FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users update own notification batches"
  ON notification_batches FOR UPDATE
  USING (auth.uid() = recipient_id);

CREATE POLICY "Service role inserts notification batches"
  ON notification_batches FOR INSERT
  WITH CHECK (true);


-- ============================================================
-- 3. NOTIFICATION PREFERENCES
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  global_enabled BOOLEAN DEFAULT TRUE,
  quiet_hours_enabled BOOLEAN DEFAULT TRUE,
  quiet_hours_start INTEGER DEFAULT 22,
  quiet_hours_end INTEGER DEFAULT 8,
  timezone TEXT DEFAULT 'Africa/Lagos',
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  email_digest_enabled BOOLEAN DEFAULT TRUE,
  email_digest_day INTEGER DEFAULT 1,
  email_digest_hour INTEGER DEFAULT 9,
  category_preferences JSONB NOT NULL DEFAULT '{
    "social": {"enabled": true, "channels": ["in_app", "badge"], "batchingEnabled": true},
    "event": {"enabled": true, "channels": ["in_app", "push", "badge"], "batchingEnabled": false},
    "collaboration": {"enabled": true, "channels": ["in_app", "push", "badge"], "batchingEnabled": false},
    "marketplace": {"enabled": true, "channels": ["in_app", "badge"], "batchingEnabled": true},
    "content": {"enabled": true, "channels": ["in_app", "badge"], "batchingEnabled": true},
    "intelligence": {"enabled": true, "channels": ["in_app", "badge"], "batchingEnabled": true},
    "system": {"enabled": true, "channels": ["in_app", "push", "email_immediate", "badge"], "batchingEnabled": false},
    "messaging": {"enabled": true, "channels": ["in_app", "push", "badge"], "batchingEnabled": false}
  }',
  type_overrides JSONB DEFAULT '{}',
  dia_insight_frequency TEXT DEFAULT 'normal',
  muted_user_ids UUID[] DEFAULT '{}',
  muted_space_ids UUID[] DEFAULT '{}',
  muted_event_ids UUID[] DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notification prefs"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 4. BADGE COUNTS (real-time per-module unread counts)
-- ============================================================

CREATE TABLE IF NOT EXISTS badge_counts (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  c_module TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, c_module)
);

ALTER TABLE badge_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own badge counts"
  ON badge_counts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own badge counts"
  ON badge_counts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages badge counts"
  ON badge_counts FOR ALL
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- 5. PUSH TOKENS
-- ============================================================

CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user
  ON push_tokens(user_id);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push tokens"
  ON push_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 6. HELPER FUNCTIONS
-- ============================================================

-- Increment badge count for a C module
CREATE OR REPLACE FUNCTION increment_badge_count(p_user_id UUID, p_c_module TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO badge_counts (user_id, c_module, count)
  VALUES (p_user_id, p_c_module, 1)
  ON CONFLICT (user_id, c_module)
  DO UPDATE SET count = badge_counts.count + 1, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement badge count for a C module
CREATE OR REPLACE FUNCTION decrement_badge_count(p_user_id UUID, p_c_module TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE badge_counts
  SET count = GREATEST(count - 1, 0), updated_at = NOW()
  WHERE user_id = p_user_id AND c_module = p_c_module;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset all badge counts for a user
CREATE OR REPLACE FUNCTION reset_badge_counts(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE badge_counts SET count = 0, updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get notification records with filtering
CREATE OR REPLACE FUNCTION get_notification_records(
  p_user_id UUID,
  p_category TEXT DEFAULT NULL,
  p_c_module TEXT DEFAULT NULL,
  p_unread_only BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT 30,
  p_cursor TIMESTAMPTZ DEFAULT NULL
)
RETURNS SETOF notification_records AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM notification_records
  WHERE recipient_id = p_user_id
    AND status IN ('delivered', 'seen', 'opened', 'acted_on')
    AND (p_category IS NULL OR category = p_category)
    AND (p_c_module IS NULL OR c_module = p_c_module)
    AND (NOT p_unread_only OR seen_at IS NULL)
    AND (p_cursor IS NULL OR created_at < p_cursor)
  ORDER BY created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get unread count by module
CREATE OR REPLACE FUNCTION get_unread_by_module(p_user_id UUID)
RETURNS TABLE(c_module TEXT, unread_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT nr.c_module, COUNT(*)::BIGINT as unread_count
  FROM notification_records nr
  WHERE nr.recipient_id = p_user_id
    AND nr.status = 'delivered'
  GROUP BY nr.c_module;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get total unread count for notification records
CREATE OR REPLACE FUNCTION get_notification_records_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  result INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO result
  FROM notification_records
  WHERE recipient_id = p_user_id
    AND status = 'delivered';
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initialize default notification preferences for a new user
CREATE OR REPLACE FUNCTION init_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Initialize badge counts for all C modules
  INSERT INTO badge_counts (user_id, c_module, count)
  VALUES
    (NEW.id, 'CONNECT', 0),
    (NEW.id, 'CONVENE', 0),
    (NEW.id, 'COLLABORATE', 0),
    (NEW.id, 'CONTRIBUTE', 0),
    (NEW.id, 'CONVEY', 0)
  ON CONFLICT (user_id, c_module) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences on user signup
DROP TRIGGER IF EXISTS on_user_created_init_notif_prefs ON auth.users;
CREATE TRIGGER on_user_created_init_notif_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION init_notification_preferences();

-- Enable realtime for notification_records
ALTER PUBLICATION supabase_realtime ADD TABLE notification_records;
ALTER PUBLICATION supabase_realtime ADD TABLE badge_counts;
