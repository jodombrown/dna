-- Drop existing function first
DROP FUNCTION IF EXISTS rpc_check_in_by_token(uuid, text);

-- Create QR check-in RPC function with correct signature
CREATE OR REPLACE FUNCTION rpc_check_in_by_token(
  p_event UUID,
  p_token TEXT
)
RETURNS JSON AS $$
DECLARE
  v_attendee RECORD;
BEGIN
  -- Find attendee by QR token
  SELECT 
    ea.id,
    ea.event_id,
    COALESCE(p.full_name, ea.guest_name, 'Guest') as name,
    p.email as email,
    ea.checked_in,
    ea.checked_in_at,
    ea.status
  INTO v_attendee
  FROM event_attendees ea
  LEFT JOIN profiles p ON ea.user_id = p.id
  WHERE ea.qr_code_token = p_token AND ea.event_id = p_event;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid QR code');
  END IF;

  IF v_attendee.checked_in THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Already checked in',
      'attendee', json_build_object('name', v_attendee.name, 'checked_in_at', v_attendee.checked_in_at)
    );
  END IF;

  IF v_attendee.status::text NOT IN ('going', 'maybe') THEN
    RETURN json_build_object('success', false, 'error', 'Registration cancelled');
  END IF;

  -- Perform check-in
  UPDATE event_attendees
  SET checked_in = true, checked_in_at = NOW(), check_in_method = 'qr'
  WHERE id = v_attendee.id;

  RETURN json_build_object(
    'success', true,
    'registration_id', v_attendee.id,
    'checkin_id', v_attendee.id,
    'attendee', json_build_object(
      'id', v_attendee.id,
      'name', v_attendee.name,
      'email', v_attendee.email
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;