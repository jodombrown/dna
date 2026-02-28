CREATE OR REPLACE FUNCTION public.notify_event_rsvp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  event_title TEXT;
  event_organizer UUID;
  attendee_name TEXT;
BEGIN
  IF NEW.status IN ('going', 'maybe') AND OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT title, organizer_id
    INTO event_title, event_organizer
    FROM events
    WHERE id = NEW.event_id;

    -- Curated events can have no organizer_id; skip notification safely
    IF event_organizer IS NULL THEN
      RETURN NEW;
    END IF;

    SELECT full_name INTO attendee_name FROM profiles WHERE id = NEW.user_id;

    PERFORM create_notification(
      event_organizer,
      NEW.user_id,
      'event_invite',
      'New RSVP',
      COALESCE(attendee_name, 'Someone') || ' is ' || NEW.status || ' for ' || COALESCE(event_title, 'your event'),
      '/dna/convene/events/' || NEW.event_id,
      'event',
      NEW.event_id
    );
  END IF;

  RETURN NEW;
END;
$function$;