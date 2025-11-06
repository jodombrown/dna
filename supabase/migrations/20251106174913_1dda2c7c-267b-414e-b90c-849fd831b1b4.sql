-- Fix Function Search Path Security Issues
-- Add SET search_path = public to all functions missing it

-- Fix notify_join_request_approved
CREATE OR REPLACE FUNCTION public.notify_join_request_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix notify_new_join_request
CREATE OR REPLACE FUNCTION public.notify_new_join_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix notify_post_like
CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  post_author_id UUID;
BEGIN
  SELECT author_id INTO post_author_id
  FROM posts
  WHERE id = NEW.post_id;

  PERFORM create_notification(
    post_author_id,
    NEW.user_id,
    'post_like',
    'New Like',
    (SELECT full_name FROM profiles WHERE id = NEW.user_id) || ' liked your post',
    '/dna/connect/feed',
    'post',
    NEW.post_id
  );
  RETURN NEW;
END;
$function$;

-- Fix notify_post_comment
CREATE OR REPLACE FUNCTION public.notify_post_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  post_author_id UUID;
BEGIN
  SELECT author_id INTO post_author_id
  FROM posts
  WHERE id = NEW.post_id;

  PERFORM create_notification(
    post_author_id,
    NEW.author_id,
    'post_comment',
    'New Comment',
    (SELECT full_name FROM profiles WHERE id = NEW.author_id) || ' commented on your post',
    '/dna/connect/feed',
    'post',
    NEW.post_id
  );
  RETURN NEW;
END;
$function$;

-- Fix notify_connection_accepted
CREATE OR REPLACE FUNCTION public.notify_connection_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    PERFORM create_notification(
      NEW.requester_id,
      NEW.recipient_id,
      'connection_accepted',
      'Connection Accepted',
      (SELECT full_name FROM profiles WHERE id = NEW.recipient_id) || ' accepted your connection request',
      '/dna/connect/network',
      'connection',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix notify_connection_request
CREATE OR REPLACE FUNCTION public.notify_connection_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  PERFORM create_notification(
    NEW.recipient_id,
    NEW.requester_id,
    'connection_request',
    'New Connection Request',
    (SELECT full_name FROM profiles WHERE id = NEW.requester_id) || ' sent you a connection request',
    '/dna/connect/network?tab=requests',
    'connection',
    NEW.id
  );
  RETURN NEW;
END;
$function$;

-- Fix notify_new_message
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  recipient_id UUID;
BEGIN
  SELECT user_id INTO recipient_id
  FROM conversation_participants
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
  LIMIT 1;

  IF recipient_id IS NOT NULL THEN
    PERFORM create_notification(
      recipient_id,
      NEW.sender_id,
      'new_message',
      'New Message',
      (SELECT full_name FROM profiles WHERE id = NEW.sender_id) || ' sent you a message',
      '/dna/connect/messages/' || NEW.conversation_id,
      'message',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix notify_event_invite
CREATE OR REPLACE FUNCTION public.notify_event_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  event_title TEXT;
  organizer_name TEXT;
BEGIN
  SELECT title INTO event_title FROM events WHERE id = NEW.event_id;
  SELECT full_name INTO organizer_name FROM profiles WHERE id = (SELECT organizer_id FROM events WHERE id = NEW.event_id);

  PERFORM create_notification(
    NEW.user_id,
    (SELECT organizer_id FROM events WHERE id = NEW.event_id),
    'event_invite',
    'Event Invitation',
    organizer_name || ' invited you to ' || event_title,
    '/dna/convene/events/' || NEW.event_id,
    'event',
    NEW.event_id
  );
  RETURN NEW;
END;
$function$;

-- Fix notify_event_rsvp
CREATE OR REPLACE FUNCTION public.notify_event_rsvp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  event_title TEXT;
  event_organizer UUID;
  attendee_name TEXT;
BEGIN
  IF NEW.status IN ('going', 'maybe') AND OLD.status != NEW.status THEN
    SELECT title, organizer_id INTO event_title, event_organizer 
    FROM events WHERE id = NEW.event_id;
    
    SELECT full_name INTO attendee_name FROM profiles WHERE id = NEW.user_id;

    PERFORM create_notification(
      event_organizer,
      NEW.user_id,
      'event_invite',
      'New RSVP',
      attendee_name || ' is ' || NEW.status || ' for ' || event_title,
      '/dna/convene/events/' || NEW.event_id,
      'event',
      NEW.event_id
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix notify_new_connection
CREATE OR REPLACE FUNCTION public.notify_new_connection()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    link_url,
    payload
  ) VALUES (
    NEW.user_id,
    'connection_accepted',
    'New connection',
    'You have a new connection',
    '/dna/network',
    jsonb_build_object(
      'actor_id', NEW.connection_id,
      'entity_type', 'connection',
      'entity_id', NEW.id
    )
  );
  
  RETURN NEW;
END;
$function$;

-- Fix notify_profile_view
CREATE OR REPLACE FUNCTION public.notify_profile_view()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  viewer_name TEXT;
  is_first_view BOOLEAN;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1 FROM profile_views
    WHERE profile_id = NEW.profile_id
      AND viewer_id = NEW.viewer_id
      AND id != NEW.id
  ) INTO is_first_view;
  
  IF is_first_view AND NEW.viewer_id IS NOT NULL THEN
    SELECT full_name INTO viewer_name FROM profiles WHERE id = NEW.viewer_id;
    
    PERFORM create_notification(
      NEW.profile_id,
      NEW.viewer_id,
      'profile_view',
      'Profile View',
      viewer_name || ' viewed your profile',
      '/dna/network?tab=connections',
      'profile',
      NEW.profile_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;