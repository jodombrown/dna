-- =====================================================
-- NOTIFICATION: Join Request Approved
-- =====================================================
CREATE OR REPLACE FUNCTION notify_join_request_approved()
RETURNS TRIGGER AS $$
DECLARE
  group_name TEXT;
  group_slug TEXT;
  reviewer_name TEXT;
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    SELECT name, slug INTO group_name, group_slug 
    FROM groups WHERE id = NEW.group_id;
    
    SELECT full_name INTO reviewer_name 
    FROM profiles WHERE id = NEW.reviewed_by;
    
    PERFORM create_notification(
      NEW.user_id,
      NEW.reviewed_by,
      'group_invite',
      'Join Request Approved',
      reviewer_name || ' approved your request to join ' || group_name,
      '/dna/convene/groups/' || group_slug,
      'group',
      NEW.group_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_join_request_approved
  AFTER UPDATE ON group_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_join_request_approved();

-- =====================================================
-- NOTIFICATION: New Join Request (for admins)
-- =====================================================
CREATE OR REPLACE FUNCTION notify_new_join_request()
RETURNS TRIGGER AS $$
DECLARE
  group_name TEXT;
  group_slug TEXT;
  requester_name TEXT;
  admin_id UUID;
BEGIN
  SELECT name, slug INTO group_name, group_slug 
  FROM groups WHERE id = NEW.group_id;
  
  SELECT full_name INTO requester_name 
  FROM profiles WHERE id = NEW.user_id;
  
  -- Notify all admins and owner
  FOR admin_id IN 
    SELECT user_id FROM group_members 
    WHERE group_id = NEW.group_id 
      AND role IN ('owner', 'admin', 'moderator')
      AND is_banned = false
  LOOP
    PERFORM create_notification(
      admin_id,
      NEW.user_id,
      'group_invite',
      'New Join Request',
      requester_name || ' wants to join ' || group_name,
      '/dna/convene/groups/' || group_slug,
      'group',
      NEW.group_id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_new_join_request
  AFTER INSERT ON group_join_requests
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_new_join_request();