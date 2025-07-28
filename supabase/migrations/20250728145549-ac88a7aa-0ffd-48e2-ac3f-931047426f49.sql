-- Add last_seen_at column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamp with time zone;

-- 1. Total registered users
CREATE OR REPLACE FUNCTION get_total_users()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT count(*)::int FROM profiles;
$$;

-- 2. Active users this week (using created_at as fallback until last_seen_at is populated)
CREATE OR REPLACE FUNCTION get_active_users_this_week()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT count(*)::int FROM profiles 
  WHERE COALESCE(last_seen_at, created_at) >= now() - interval '7 days';
$$;

-- 3. Total connections (using contact_requests table)
CREATE OR REPLACE FUNCTION get_total_connections()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT count(*)::int FROM contact_requests WHERE status = 'accepted';
$$;

-- 4. Total posts created
CREATE OR REPLACE FUNCTION get_total_posts()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT count(*)::int FROM posts;
$$;

-- 5. Total events created
CREATE OR REPLACE FUNCTION get_total_events()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT count(*)::int FROM events;
$$;

-- 6. Community engagement rate
CREATE OR REPLACE FUNCTION get_engagement_rate()
RETURNS numeric
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT round(
    (
      SELECT count(*) FROM post_likes
    )::decimal / greatest((SELECT count(*) FROM profiles), 1), 2
  );
$$;