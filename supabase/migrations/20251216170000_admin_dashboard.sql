-- Admin Dashboard Migration
-- DNA Platform - Comprehensive Admin System
-- Created: 2025-12-16

-- ============================================================
-- PHASE 1: ENUM TYPE CREATION
-- ============================================================

DO $$
BEGIN
  -- Create admin_role_level enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role_level') THEN
    CREATE TYPE admin_role_level AS ENUM (
      'super_admin',
      'platform_admin',
      'content_admin',
      'analytics_admin',
      'support_admin',
      'event_admin'
    );
  END IF;
END $$;

-- ============================================================
-- PHASE 2: TABLE CREATION
-- ============================================================

-- Table: admin_allowed_emails
-- Stores approved external emails that can access admin
CREATE TABLE IF NOT EXISTS admin_allowed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role admin_role_level NOT NULL DEFAULT 'platform_admin',
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: super_admin_protected
-- Immutable list of protected super admins who cannot be demoted
CREATE TABLE IF NOT EXISTS super_admin_protected (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  protected_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT
);

-- Table: system_settings
-- Platform-wide configuration settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  setting_type TEXT CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'array')),
  category TEXT CHECK (category IN ('general', 'security', 'features', 'notifications', 'monetization')),
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  requires_restart BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: announcements
-- Platform-wide announcements for users
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  announcement_type TEXT CHECK (announcement_type IN ('info', 'warning', 'critical', 'maintenance', 'celebration')) DEFAULT 'info',
  target_audience TEXT[] DEFAULT ARRAY['all'],
  is_active BOOLEAN DEFAULT true,
  is_dismissible BOOLEAN DEFAULT true,
  display_location TEXT[] DEFAULT ARRAY['dashboard'],
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: announcement_dismissals
-- Tracks which users have dismissed which announcements
CREATE TABLE IF NOT EXISTS announcement_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- Table: admin_sessions
-- Tracks admin login sessions for security
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role_level admin_role_level NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  login_at TIMESTAMPTZ DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  logout_at TIMESTAMPTZ,
  logout_reason TEXT CHECK (logout_reason IN ('manual', 'timeout', 'forced', 'session_revoked')),
  is_active BOOLEAN DEFAULT true
);

-- Table: feedback_categories
-- Categories for user feedback management
CREATE TABLE IF NOT EXISTS feedback_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  icon TEXT DEFAULT 'message-circle',
  default_priority TEXT DEFAULT 'medium' CHECK (default_priority IN ('low', 'medium', 'high', 'critical')),
  sla_hours INTEGER DEFAULT 48,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- ============================================================
-- PHASE 3: INITIAL DATA SEEDING
-- ============================================================

-- Seed protected super admins
INSERT INTO super_admin_protected (email, reason)
VALUES
  ('aweh@diasporanetwork.africa', 'Co-founder - immutable super admin'),
  ('jaune@diasporanetwork.africa', 'Founder - immutable super admin')
ON CONFLICT (email) DO NOTHING;

-- Seed allowed external emails
INSERT INTO admin_allowed_emails (email, role, notes)
VALUES
  ('jaunelamarro@icloud.com', 'super_admin', 'Founder personal email - full access')
ON CONFLICT (email) DO NOTHING;

-- Seed feedback categories
INSERT INTO feedback_categories (name, description, color, icon, default_priority, sla_hours, sort_order)
VALUES
  ('bug', 'Bug reports and technical issues', '#EF4444', 'bug', 'high', 24, 1),
  ('feature_request', 'New feature suggestions', '#8B5CF6', 'lightbulb', 'medium', 168, 2),
  ('ux_feedback', 'User experience feedback', '#F59E0B', 'layout', 'medium', 72, 3),
  ('content_report', 'Reported content issues', '#DC2626', 'flag', 'critical', 12, 4),
  ('support', 'Support requests and help', '#3B82F6', 'help-circle', 'high', 24, 5),
  ('general', 'General feedback', '#6B7280', 'message-circle', 'low', 168, 6),
  ('compliment', 'Positive feedback and thanks', '#10B981', 'heart', 'low', 168, 7)
ON CONFLICT (name) DO NOTHING;

-- Seed system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_sensitive, requires_restart)
VALUES
  ('platform_name', '"Diaspora Network of Africa"', 'string', 'general', 'Platform display name', false, false),
  ('platform_tagline', '"The Operating System for the Global African Diaspora"', 'string', 'general', 'Platform tagline', false, false),
  ('maintenance_mode', 'false', 'boolean', 'general', 'Enable maintenance mode', false, false),
  ('registration_enabled', 'true', 'boolean', 'general', 'Allow new user registration', false, false),
  ('admin_session_timeout_minutes', '480', 'number', 'security', 'Admin session timeout in minutes', false, false),
  ('max_login_attempts', '5', 'number', 'security', 'Maximum login attempts before lockout', false, false),
  ('require_email_verification', 'true', 'boolean', 'security', 'Require email verification for new accounts', false, false),
  ('admin_mfa_required', 'false', 'boolean', 'security', 'Require MFA for admin accounts', false, false),
  ('adin_matching_enabled', 'true', 'boolean', 'features', 'Enable ADIN matching system', false, false),
  ('events_enabled', 'true', 'boolean', 'features', 'Enable CONVENE events module', false, false),
  ('projects_enabled', 'true', 'boolean', 'features', 'Enable COLLABORATE projects module', false, false),
  ('dms_enabled', 'false', 'boolean', 'features', 'Enable direct messaging', false, false),
  ('max_connections_per_user', '500', 'number', 'features', 'Maximum connections per user', false, false),
  ('email_notifications_enabled', 'true', 'boolean', 'notifications', 'Enable email notifications', false, false),
  ('push_notifications_enabled', 'false', 'boolean', 'notifications', 'Enable push notifications', false, false),
  ('digest_email_frequency', '"weekly"', 'string', 'notifications', 'Frequency of digest emails', false, false),
  ('freemium_connection_limit', '50', 'number', 'monetization', 'Free tier connection limit', false, false),
  ('premium_price_monthly_usd', '9.99', 'number', 'monetization', 'Monthly premium subscription price', true, false),
  ('event_platform_fee_percent', '5', 'number', 'monetization', 'Platform fee percentage for paid events', true, false)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================
-- PHASE 4: DATABASE FUNCTIONS
-- ============================================================

-- Function: is_valid_admin_email
-- Validates if an email is authorized for admin access
CREATE OR REPLACE FUNCTION is_valid_admin_email(check_email TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  role_level admin_role_level,
  is_super_admin BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_domain TEXT;
  protected_admin BOOLEAN;
  allowed_record RECORD;
BEGIN
  -- Extract domain from email
  email_domain := split_part(check_email, '@', 2);

  -- Check if it's a protected super admin
  SELECT EXISTS(SELECT 1 FROM super_admin_protected WHERE email = check_email) INTO protected_admin;

  IF protected_admin THEN
    RETURN QUERY SELECT true, 'super_admin'::admin_role_level, true;
    RETURN;
  END IF;

  -- Check if it's a diasporanetwork.africa email
  IF email_domain = 'diasporanetwork.africa' THEN
    RETURN QUERY SELECT true, 'platform_admin'::admin_role_level, false;
    RETURN;
  END IF;

  -- Check if it's in the allowed emails list
  SELECT * INTO allowed_record FROM admin_allowed_emails
  WHERE email = check_email AND is_active = true;

  IF FOUND THEN
    RETURN QUERY SELECT true, allowed_record.role::admin_role_level, (allowed_record.role = 'super_admin');
    RETURN;
  END IF;

  -- Not authorized
  RETURN QUERY SELECT false, NULL::admin_role_level, false;
END;
$$;

-- Function: get_current_admin_status
-- Gets the current authenticated user's admin status
CREATE OR REPLACE FUNCTION get_current_admin_status()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  is_admin BOOLEAN,
  role_level admin_role_level,
  is_super_admin BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  current_email TEXT;
  admin_check RECORD;
BEGIN
  -- Get current user
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, false, NULL::admin_role_level, false;
    RETURN;
  END IF;

  -- Get user email
  SELECT au.email INTO current_email FROM auth.users au WHERE au.id = current_user_id;

  IF current_email IS NULL THEN
    RETURN QUERY SELECT current_user_id, NULL::TEXT, false, NULL::admin_role_level, false;
    RETURN;
  END IF;

  -- Check admin status
  SELECT * INTO admin_check FROM is_valid_admin_email(current_email);

  RETURN QUERY SELECT
    current_user_id,
    current_email,
    admin_check.is_valid,
    admin_check.role_level,
    admin_check.is_super_admin;
END;
$$;

-- Function: create_admin_session
-- Creates a new admin session and logs the activity
CREATE OR REPLACE FUNCTION create_admin_session(
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_info JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  current_email TEXT;
  admin_check RECORD;
  new_session_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user email and admin status
  SELECT au.email INTO current_email FROM auth.users au WHERE au.id = current_user_id;
  SELECT * INTO admin_check FROM is_valid_admin_email(current_email);

  IF NOT admin_check.is_valid THEN
    RAISE EXCEPTION 'Not authorized as admin';
  END IF;

  -- End any existing active sessions for this user
  UPDATE admin_sessions
  SET is_active = false, logout_at = now(), logout_reason = 'session_revoked'
  WHERE user_id = current_user_id AND is_active = true;

  -- Create new session
  INSERT INTO admin_sessions (
    user_id, email, role_level, ip_address, user_agent, device_info
  )
  VALUES (
    current_user_id, current_email, admin_check.role_level, p_ip_address, p_user_agent, p_device_info
  )
  RETURNING id INTO new_session_id;

  -- Log to admin_activity_log
  INSERT INTO admin_activity_log (admin_id, action_type, action_details)
  VALUES (
    current_user_id,
    'admin_login',
    jsonb_build_object(
      'session_id', new_session_id,
      'role_level', admin_check.role_level,
      'ip_address', p_ip_address,
      'user_agent', p_user_agent
    )
  );

  RETURN new_session_id;
END;
$$;

-- Function: end_admin_session
-- Ends the current admin session
CREATE OR REPLACE FUNCTION end_admin_session(p_reason TEXT DEFAULT 'manual')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  session_ended BOOLEAN := false;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- End active session
  UPDATE admin_sessions
  SET is_active = false, logout_at = now(), logout_reason = p_reason
  WHERE user_id = current_user_id AND is_active = true;

  IF FOUND THEN
    session_ended := true;

    -- Log logout
    INSERT INTO admin_activity_log (admin_id, action_type, action_details)
    VALUES (
      current_user_id,
      'admin_logout',
      jsonb_build_object('reason', p_reason)
    );
  END IF;

  RETURN session_ended;
END;
$$;

-- Function: get_admin_dashboard_stats
-- Gets all dashboard statistics
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  user_stats JSONB;
  connection_stats JSONB;
  event_stats JSONB;
  content_stats JSONB;
  feedback_stats JSONB;
  moderation_stats JSONB;
  admin_check RECORD;
  current_email TEXT;
BEGIN
  -- Verify admin access
  SELECT au.email INTO current_email FROM auth.users au WHERE au.id = auth.uid();
  SELECT * INTO admin_check FROM is_valid_admin_email(current_email);

  IF NOT admin_check.is_valid THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- User statistics
  SELECT jsonb_build_object(
    'total', (SELECT COUNT(*) FROM profiles),
    'new_today', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE),
    'new_this_week', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'new_this_month', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'dau', (SELECT COUNT(DISTINCT user_id) FROM admin_activity_log WHERE created_at >= CURRENT_DATE),
    'wau', (SELECT COUNT(DISTINCT user_id) FROM (
      SELECT p.id as user_id FROM profiles p WHERE p.updated_at >= CURRENT_DATE - INTERVAL '7 days'
    ) weekly_active),
    'mau', (SELECT COUNT(DISTINCT user_id) FROM (
      SELECT p.id as user_id FROM profiles p WHERE p.updated_at >= CURRENT_DATE - INTERVAL '30 days'
    ) monthly_active)
  ) INTO user_stats;

  -- Connection statistics
  SELECT jsonb_build_object(
    'total', (SELECT COUNT(*) FROM connections WHERE status = 'accepted'),
    'pending', (SELECT COUNT(*) FROM connections WHERE status = 'pending'),
    'new_this_week', (SELECT COUNT(*) FROM connections WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND status = 'accepted')
  ) INTO connection_stats;

  -- Event statistics
  SELECT jsonb_build_object(
    'total', (SELECT COUNT(*) FROM events),
    'upcoming', (SELECT COUNT(*) FROM events WHERE start_time > now()),
    'this_week', (SELECT COUNT(*) FROM events WHERE start_time >= CURRENT_DATE AND start_time < CURRENT_DATE + INTERVAL '7 days')
  ) INTO event_stats;

  -- Content statistics
  SELECT jsonb_build_object(
    'total_posts', (SELECT COUNT(*) FROM posts),
    'posts_this_week', (SELECT COUNT(*) FROM posts WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')
  ) INTO content_stats;

  -- Feedback statistics
  SELECT jsonb_build_object(
    'total', (SELECT COUNT(*) FROM user_feedback),
    'pending', (SELECT COUNT(*) FROM user_feedback WHERE status = 'pending'),
    'unresolved', (SELECT COUNT(*) FROM user_feedback WHERE status NOT IN ('resolved', 'closed'))
  ) INTO feedback_stats;

  -- Moderation statistics
  SELECT jsonb_build_object(
    'pending_flags', (SELECT COUNT(*) FROM content_flags WHERE status = 'pending'),
    'resolved_this_week', (SELECT COUNT(*) FROM content_flags WHERE resolved_at >= CURRENT_DATE - INTERVAL '7 days')
  ) INTO moderation_stats;

  -- Build final result
  result := jsonb_build_object(
    'users', user_stats,
    'connections', connection_stats,
    'events', event_stats,
    'content', content_stats,
    'feedback', feedback_stats,
    'moderation', moderation_stats,
    'generated_at', now()
  );

  RETURN result;
END;
$$;

-- Function: get_user_growth_data
-- Gets user growth data for charts
CREATE OR REPLACE FUNCTION get_user_growth_data(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  new_users BIGINT,
  cumulative_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_check RECORD;
  current_email TEXT;
BEGIN
  -- Verify admin access
  SELECT au.email INTO current_email FROM auth.users au WHERE au.id = auth.uid();
  SELECT * INTO admin_check FROM is_valid_admin_email(current_email);

  IF NOT admin_check.is_valid THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (p_days || ' days')::INTERVAL,
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE AS date
  ),
  daily_signups AS (
    SELECT
      created_at::DATE AS signup_date,
      COUNT(*) AS count
    FROM profiles
    WHERE created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY created_at::DATE
  )
  SELECT
    ds.date,
    COALESCE(du.count, 0) AS new_users,
    SUM(COALESCE(du.count, 0)) OVER (ORDER BY ds.date) +
      (SELECT COUNT(*) FROM profiles WHERE created_at < CURRENT_DATE - (p_days || ' days')::INTERVAL) AS cumulative_users
  FROM date_series ds
  LEFT JOIN daily_signups du ON ds.date = du.signup_date
  ORDER BY ds.date;
END;
$$;

-- Function: get_user_segments_distribution
-- Gets distribution of user segments
CREATE OR REPLACE FUNCTION get_user_segments_distribution()
RETURNS TABLE (
  segment TEXT,
  count BIGINT,
  percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_check RECORD;
  current_email TEXT;
  total_users BIGINT;
BEGIN
  -- Verify admin access
  SELECT au.email INTO current_email FROM auth.users au WHERE au.id = auth.uid();
  SELECT * INTO admin_check FROM is_valid_admin_email(current_email);

  IF NOT admin_check.is_valid THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT COUNT(*) INTO total_users FROM profiles;

  RETURN QUERY
  WITH segment_counts AS (
    SELECT
      COALESCE(diaspora_status, 'Unspecified') AS segment_name,
      COUNT(*) AS segment_count
    FROM profiles
    GROUP BY diaspora_status
  )
  SELECT
    sc.segment_name AS segment,
    sc.segment_count AS count,
    CASE
      WHEN total_users > 0 THEN ROUND((sc.segment_count::NUMERIC / total_users) * 100, 2)
      ELSE 0
    END AS percentage
  FROM segment_counts sc
  ORDER BY sc.segment_count DESC;
END;
$$;

-- Function: get_system_setting
-- Gets a single system setting
CREATE OR REPLACE FUNCTION get_system_setting(p_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  setting_record RECORD;
BEGIN
  SELECT * INTO setting_record FROM system_settings WHERE setting_key = p_key;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN setting_record.setting_value;
END;
$$;

-- Function: update_system_setting
-- Updates a system setting with audit logging
CREATE OR REPLACE FUNCTION update_system_setting(p_key TEXT, p_value JSONB, p_admin_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_check RECORD;
  current_email TEXT;
  actual_admin_id UUID;
  old_value JSONB;
BEGIN
  -- Get admin ID
  actual_admin_id := COALESCE(p_admin_id, auth.uid());

  IF actual_admin_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify super_admin or platform_admin access
  SELECT au.email INTO current_email FROM auth.users au WHERE au.id = actual_admin_id;
  SELECT * INTO admin_check FROM is_valid_admin_email(current_email);

  IF NOT admin_check.is_valid OR admin_check.role_level NOT IN ('super_admin', 'platform_admin') THEN
    RAISE EXCEPTION 'Not authorized - requires super_admin or platform_admin role';
  END IF;

  -- Get old value for logging
  SELECT setting_value INTO old_value FROM system_settings WHERE setting_key = p_key;

  -- Update setting
  UPDATE system_settings
  SET setting_value = p_value, updated_by = actual_admin_id, updated_at = now()
  WHERE setting_key = p_key;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Log the change
  INSERT INTO admin_activity_log (admin_id, action_type, action_details)
  VALUES (
    actual_admin_id,
    'setting_updated',
    jsonb_build_object(
      'setting_key', p_key,
      'old_value', old_value,
      'new_value', p_value
    )
  );

  RETURN true;
END;
$$;

-- Function: get_active_announcements
-- Gets active announcements for a specific location
CREATE OR REPLACE FUNCTION get_active_announcements(p_location TEXT DEFAULT 'dashboard')
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  announcement_type TEXT,
  is_dismissible BOOLEAN,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();

  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.content,
    a.announcement_type,
    a.is_dismissible,
    a.starts_at,
    a.ends_at,
    a.created_at
  FROM announcements a
  WHERE a.is_active = true
    AND (a.starts_at IS NULL OR a.starts_at <= now())
    AND (a.ends_at IS NULL OR a.ends_at > now())
    AND p_location = ANY(a.display_location)
    AND NOT EXISTS (
      SELECT 1 FROM announcement_dismissals ad
      WHERE ad.announcement_id = a.id
        AND ad.user_id = current_user_id
    )
  ORDER BY
    CASE a.announcement_type
      WHEN 'critical' THEN 1
      WHEN 'maintenance' THEN 2
      WHEN 'warning' THEN 3
      WHEN 'info' THEN 4
      WHEN 'celebration' THEN 5
    END,
    a.created_at DESC;
END;
$$;

-- Function: update_admin_session_activity
-- Updates the last_activity timestamp for current admin session
CREATE OR REPLACE FUNCTION update_admin_session_activity()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE admin_sessions
  SET last_activity_at = now()
  WHERE user_id = auth.uid() AND is_active = true;

  RETURN FOUND;
END;
$$;

-- Function: log_admin_activity
-- Logs admin activity for audit purposes
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_action_type TEXT,
  p_action_details JSONB DEFAULT '{}'::JSONB,
  p_target_user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  new_log_id UUID;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO admin_activity_log (admin_id, action_type, action_details, target_user_id)
  VALUES (current_user_id, p_action_type, p_action_details, p_target_user_id)
  RETURNING id INTO new_log_id;

  RETURN new_log_id;
END;
$$;

-- ============================================================
-- PHASE 5: ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all new tables
ALTER TABLE admin_allowed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_protected ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_dismissals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_categories ENABLE ROW LEVEL SECURITY;

-- Policies for admin_allowed_emails (super_admin only)
DROP POLICY IF EXISTS "Super admins can manage allowed emails" ON admin_allowed_emails;
CREATE POLICY "Super admins can manage allowed emails" ON admin_allowed_emails
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM is_valid_admin_email(
        (SELECT email FROM auth.users WHERE id = auth.uid())
      ) WHERE is_super_admin = true
    )
  );

-- Policies for super_admin_protected (read-only for admins)
DROP POLICY IF EXISTS "Admins can view protected admins" ON super_admin_protected;
CREATE POLICY "Admins can view protected admins" ON super_admin_protected
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM is_valid_admin_email(
        (SELECT email FROM auth.users WHERE id = auth.uid())
      ) WHERE is_valid = true
    )
  );

-- Policies for system_settings
DROP POLICY IF EXISTS "Admins can read system settings" ON system_settings;
CREATE POLICY "Admins can read system settings" ON system_settings
  FOR SELECT
  USING (
    (NOT is_sensitive) OR
    EXISTS (
      SELECT 1 FROM is_valid_admin_email(
        (SELECT email FROM auth.users WHERE id = auth.uid())
      ) WHERE is_valid = true
    )
  );

DROP POLICY IF EXISTS "Super/platform admins can modify settings" ON system_settings;
CREATE POLICY "Super/platform admins can modify settings" ON system_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM is_valid_admin_email(
        (SELECT email FROM auth.users WHERE id = auth.uid())
      ) WHERE is_valid = true AND role_level IN ('super_admin', 'platform_admin')
    )
  );

-- Policies for announcements
DROP POLICY IF EXISTS "Anyone can read active announcements" ON announcements;
CREATE POLICY "Anyone can read active announcements" ON announcements
  FOR SELECT
  USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now()));

DROP POLICY IF EXISTS "Admins can manage all announcements" ON announcements;
CREATE POLICY "Admins can manage all announcements" ON announcements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM is_valid_admin_email(
        (SELECT email FROM auth.users WHERE id = auth.uid())
      ) WHERE is_valid = true
    )
  );

-- Policies for announcement_dismissals
DROP POLICY IF EXISTS "Users can manage own dismissals" ON announcement_dismissals;
CREATE POLICY "Users can manage own dismissals" ON announcement_dismissals
  FOR ALL
  USING (user_id = auth.uid());

-- Policies for admin_sessions
DROP POLICY IF EXISTS "Admins can view own sessions" ON admin_sessions;
CREATE POLICY "Admins can view own sessions" ON admin_sessions
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM is_valid_admin_email(
        (SELECT email FROM auth.users WHERE id = auth.uid())
      ) WHERE is_super_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can manage own sessions" ON admin_sessions;
CREATE POLICY "Admins can manage own sessions" ON admin_sessions
  FOR ALL
  USING (user_id = auth.uid());

-- Policies for feedback_categories
DROP POLICY IF EXISTS "Anyone can read feedback categories" ON feedback_categories;
CREATE POLICY "Anyone can read feedback categories" ON feedback_categories
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage feedback categories" ON feedback_categories;
CREATE POLICY "Admins can manage feedback categories" ON feedback_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM is_valid_admin_email(
        (SELECT email FROM auth.users WHERE id = auth.uid())
      ) WHERE is_valid = true
    )
  );

-- ============================================================
-- PHASE 6: INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_admin_allowed_emails_email ON admin_allowed_emails(email);
CREATE INDEX IF NOT EXISTS idx_admin_allowed_emails_active ON admin_allowed_emails(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_super_admin_protected_email ON super_admin_protected(email);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_announcements_dates ON announcements(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_announcement_dismissals_user ON announcement_dismissals(user_id);
CREATE INDEX IF NOT EXISTS idx_announcement_dismissals_announcement ON announcement_dismissals(announcement_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_feedback_categories_active ON feedback_categories(is_active) WHERE is_active = true;

-- ============================================================
-- PHASE 7: TRIGGERS FOR UPDATED_AT COLUMNS
-- ============================================================

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist and recreate
DROP TRIGGER IF EXISTS update_admin_allowed_emails_updated_at ON admin_allowed_emails;
CREATE TRIGGER update_admin_allowed_emails_updated_at
  BEFORE UPDATE ON admin_allowed_emails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PHASE 8: GRANT PERMISSIONS
-- ============================================================

-- Grant permissions to authenticated users for RPC functions
GRANT EXECUTE ON FUNCTION is_valid_admin_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_admin_status() TO authenticated;
GRANT EXECUTE ON FUNCTION create_admin_session(INET, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION end_admin_session(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_growth_data(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_segments_distribution() TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_setting(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_system_setting(TEXT, JSONB, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_announcements(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_admin_session_activity() TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_activity(TEXT, JSONB, UUID) TO authenticated;

-- Grant table permissions (RLS will enforce access)
GRANT SELECT ON admin_allowed_emails TO authenticated;
GRANT SELECT ON super_admin_protected TO authenticated;
GRANT SELECT, UPDATE ON system_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON announcements TO authenticated;
GRANT SELECT, INSERT, DELETE ON announcement_dismissals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON admin_sessions TO authenticated;
GRANT SELECT ON feedback_categories TO authenticated;

-- ============================================================
-- COMPLETE
-- ============================================================
