-- BD490: publish-time delivery-endpoint gate.
--
-- An event with format IN ('in_person', 'hybrid') cannot transition
-- lifecycle_state to 'published' unless it has at least one row in
-- event_delivery_endpoints with type = 'physical_room'. format = 'virtual'
-- is exempt; its door is the stream URL, already required at creation.
--
-- Fires only on the TRANSITION into 'published' (OLD.lifecycle_state IS
-- DISTINCT FROM 'published' AND NEW.lifecycle_state = 'published'), so
-- subsequent edits to an already-published event (e.g. a title change, or
-- an endpoint later removed) never re-trigger this check. That is a
-- separate integrity question, out of scope here.
--
-- Does not retroactively act on the seven events already published
-- doorless: the gate applies going forward only, and none of them are
-- touched by this migration.

CREATE OR REPLACE FUNCTION public.enforce_publish_delivery_endpoint_gate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_physical_room boolean;
BEGIN
  IF NEW.lifecycle_state = 'published'
     AND OLD.lifecycle_state IS DISTINCT FROM 'published'
     AND NEW.format IN ('in_person', 'hybrid') THEN

    SELECT EXISTS (
      SELECT 1
      FROM public.event_delivery_endpoints ede
      WHERE ede.event_id = NEW.id
        AND ede.type = 'physical_room'
    ) INTO has_physical_room;

    IF NOT has_physical_room THEN
      RAISE EXCEPTION 'Cannot publish an in-person or hybrid event without a physical_room delivery endpoint'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS publish_delivery_endpoint_gate ON public.events;
CREATE CONSTRAINT TRIGGER publish_delivery_endpoint_gate
AFTER UPDATE OF lifecycle_state ON public.events
FOR EACH ROW
WHEN (NEW.lifecycle_state = 'published' AND OLD.lifecycle_state IS DISTINCT FROM 'published')
EXECUTE FUNCTION public.enforce_publish_delivery_endpoint_gate();

COMMENT ON FUNCTION public.enforce_publish_delivery_endpoint_gate() IS 'BD490. Blocks the transition of events.lifecycle_state into ''published'' for format IN (''in_person'',''hybrid'') unless at least one event_delivery_endpoints row with type=''physical_room'' exists for that event. Fires only on the transition into published, not on later updates to an already-published event. format=''virtual'' is exempt (stream URL required at creation, checked elsewhere). Does not act on the seven events published before this gate existed.';
