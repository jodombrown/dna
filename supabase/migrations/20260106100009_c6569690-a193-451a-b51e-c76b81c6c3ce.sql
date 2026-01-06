-- =====================================================
-- MIGRATION 009: Helper function for permission checks
-- =====================================================

CREATE OR REPLACE FUNCTION check_event_permission(
  p_event_id UUID,
  p_user_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_event RECORD;
  v_role RECORD;
  v_has_permission BOOLEAN := false;
BEGIN
  -- Get event
  SELECT * INTO v_event FROM events WHERE id = p_event_id;
  IF NOT FOUND THEN RETURN false; END IF;

  -- Check if user is organizer (owner by default)
  IF v_event.organizer_id = p_user_id THEN
    RETURN true;
  END IF;

  -- Get user's role
  SELECT * INTO v_role
  FROM event_roles
  WHERE event_id = p_event_id
    AND user_id = p_user_id
    AND status = 'active';

  IF NOT FOUND THEN RETURN false; END IF;

  -- Check role-based permission
  CASE p_permission
    WHEN 'view' THEN
      v_has_permission := true;  -- All roles can view
    WHEN 'edit' THEN
      v_has_permission := v_role.role IN ('owner', 'cohost', 'manager');
    WHEN 'manage_tickets' THEN
      v_has_permission := v_role.role IN ('owner', 'cohost', 'manager');
    WHEN 'view_attendees' THEN
      v_has_permission := v_role.role IN ('owner', 'cohost', 'manager', 'checkin');
    WHEN 'message_attendees' THEN
      v_has_permission := v_role.role IN ('owner', 'cohost', 'manager');
    WHEN 'check_in' THEN
      v_has_permission := v_role.role IN ('owner', 'cohost', 'manager', 'checkin');
    WHEN 'view_analytics' THEN
      v_has_permission := v_role.role IN ('owner', 'cohost', 'manager', 'promoter');
    WHEN 'view_payments' THEN
      v_has_permission := v_role.role IN ('owner', 'cohost');
    WHEN 'manage_team' THEN
      v_has_permission := v_role.role IN ('owner', 'cohost');
    WHEN 'cancel' THEN
      v_has_permission := v_role.role IN ('owner', 'cohost');
    WHEN 'delete' THEN
      v_has_permission := v_role.role = 'owner';
    WHEN 'transfer' THEN
      v_has_permission := v_role.role = 'owner';
    ELSE
      v_has_permission := false;
  END CASE;

  -- Check for permission override in JSONB
  IF v_role.permissions ? ('can_' || p_permission) THEN
    v_has_permission := (v_role.permissions->('can_' || p_permission))::boolean;
  END IF;

  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_event_permission IS 'Check if a user has a specific permission for an event based on roles';
