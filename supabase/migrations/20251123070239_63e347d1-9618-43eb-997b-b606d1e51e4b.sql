-- DNA | FEED Lockdown v1 - Fix contact_requests references
-- The contact_requests table was dropped but some functions still reference it
-- This migration fixes those functions to use the connections table instead

-- Fix get_total_connections to use connections table
CREATE OR REPLACE FUNCTION get_total_connections()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT count(*)::int FROM connections WHERE status = 'accepted';
$$;