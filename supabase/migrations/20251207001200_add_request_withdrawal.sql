-- Migration: Add Connection Request Withdrawal & Auto-Expiration
-- Allows users to withdraw pending requests and auto-expires old requests

-- Function to withdraw a connection request
CREATE OR REPLACE FUNCTION withdraw_connection_request(
  p_request_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_record RECORD;
BEGIN
  -- Get the connection request
  SELECT * INTO v_request_record
  FROM connections
  WHERE id = p_request_id AND status = 'pending';

  -- Check if request exists and is pending
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Connection request not found or not pending';
  END IF;

  -- Verify the user is the requester
  IF v_request_record.requester_id != p_user_id THEN
    RAISE EXCEPTION 'You can only withdraw requests you sent';
  END IF;

  -- Delete the connection request
  DELETE FROM connections WHERE id = p_request_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Connection request withdrawn successfully'
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION withdraw_connection_request TO authenticated;

-- Function to clean up expired connection requests
CREATE OR REPLACE FUNCTION cleanup_expired_connection_requests()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete pending requests older than 90 days
  WITH deleted AS (
    DELETE FROM connections
    WHERE
      status = 'pending'
      AND created_at < NOW() - INTERVAL '90 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;

  RETURN v_deleted_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION cleanup_expired_connection_requests TO authenticated;

-- Create a pg_cron job to run cleanup daily (if pg_cron is available)
-- Note: This requires pg_cron extension to be enabled
-- If pg_cron is not available, you can run this manually or via a scheduled task

DO $$
BEGIN
  -- Try to create a cron job if pg_cron is available
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Delete existing job if it exists
    PERFORM cron.unschedule('cleanup-expired-connection-requests');

    -- Schedule daily cleanup at 2 AM
    PERFORM cron.schedule(
      'cleanup-expired-connection-requests',
      '0 2 * * *', -- Every day at 2 AM
      $$SELECT cleanup_expired_connection_requests()$$
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- pg_cron not available, skip scheduling
    RAISE NOTICE 'pg_cron not available - connection request cleanup must be run manually';
END;
$$;

-- Function to get sent connection requests
CREATE OR REPLACE FUNCTION get_sent_connection_requests(
  p_user_id UUID
)
RETURNS TABLE(
  connection_id UUID,
  recipient_id UUID,
  recipient_name TEXT,
  recipient_avatar TEXT,
  recipient_headline TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS connection_id,
    p.id AS recipient_id,
    p.full_name AS recipient_name,
    p.avatar_url AS recipient_avatar,
    p.headline AS recipient_headline,
    c.created_at
  FROM connections c
  INNER JOIN profiles p ON c.recipient_id = p.id
  WHERE
    c.requester_id = p_user_id
    AND c.status = 'pending'
  ORDER BY c.created_at DESC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_sent_connection_requests TO authenticated;

-- Add comments
COMMENT ON FUNCTION withdraw_connection_request IS 'Allows users to withdraw their own pending connection requests';
COMMENT ON FUNCTION cleanup_expired_connection_requests IS 'Deletes pending connection requests older than 90 days - should be run daily';
COMMENT ON FUNCTION get_sent_connection_requests IS 'Gets all pending connection requests sent by the user';
