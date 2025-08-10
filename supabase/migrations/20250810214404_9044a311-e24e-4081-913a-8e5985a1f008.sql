
-- 1) Approve/decline/move-to-waitlist for a specific user on an event
-- Allows event owners or admins to set status: going | pending | cancelled | waitlist
CREATE OR REPLACE FUNCTION public.rpc_event_set_status(p_event uuid, p_user uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_pos integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT (public.is_event_owner(p_event, v_uid) OR public.is_admin_user(v_uid)) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF p_status NOT IN ('going','pending','cancelled','waitlist') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;

  IF p_status = 'waitlist' THEN
    -- Remove any registration and add to waitlist at end if not already present
    DELETE FROM public.event_registrations
    WHERE event_id = p_event AND user_id = p_user;

    IF NOT EXISTS (
      SELECT 1 FROM public.event_waitlist
      WHERE event_id = p_event AND user_id = p_user
    ) THEN
      SELECT COALESCE(MAX(position), 0) + 1 INTO v_pos
      FROM public.event_waitlist
      WHERE event_id = p_event;

      INSERT INTO public.event_waitlist(event_id, user_id, position)
      VALUES (p_event, p_user, COALESCE(v_pos, 1));
    END IF;
  ELSE
    -- Ensure user is not on waitlist, then upsert registration with desired status
    DELETE FROM public.event_waitlist
    WHERE event_id = p_event AND user_id = p_user;

    INSERT INTO public.event_registrations(event_id, user_id, status)
    VALUES (p_event, p_user, p_status)
    ON CONFLICT (event_id, user_id) DO UPDATE
      SET status = EXCLUDED.status,
          cancelled_at = CASE WHEN EXCLUDED.status = 'cancelled' THEN now() ELSE NULL END;
  END IF;

  -- Keep attendee_count accurate (counts 'going')
  PERFORM public.update_event_attendee_count(p_event);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.rpc_event_set_status(uuid, uuid, text) TO authenticated;



-- 2) Promote from waitlist (either the next-in-line or a specific user)
-- Returns the promoted user_id (or null if none)
CREATE OR REPLACE FUNCTION public.rpc_event_waitlist_promote(p_event uuid, p_user uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_promoted uuid;
  v_pos integer;
  v_owner uuid;
  v_title text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT (public.is_event_owner(p_event, v_uid) OR public.is_admin_user(v_uid)) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF p_user IS NULL THEN
    -- Use existing helper to promote next person in line
    v_promoted := public.promote_from_waitlist(p_event);
    RETURN v_promoted;
  ELSE
    -- Promote a specific user currently on the waitlist
    SELECT position INTO v_pos
    FROM public.event_waitlist
    WHERE event_id = p_event AND user_id = p_user;

    IF v_pos IS NULL THEN
      RAISE EXCEPTION 'user not on waitlist';
    END IF;

    -- Create registration if missing
    INSERT INTO public.event_registrations(event_id, user_id)
    VALUES (p_event, p_user)
    ON CONFLICT (event_id, user_id) DO NOTHING;

    -- Remove from waitlist and compact positions
    DELETE FROM public.event_waitlist
    WHERE event_id = p_event AND user_id = p_user;

    UPDATE public.event_waitlist
    SET position = position - 1
    WHERE event_id = p_event AND position > v_pos;

    -- Notify promoted user and host (best effort)
    SELECT public.event_owner_id(p_event), title INTO v_owner, v_title
    FROM public.events WHERE id = p_event;

    PERFORM public.add_notification(
      p_user,
      'event_waitlist_promoted',
      'You have a spot',
      COALESCE(v_title, 'Event') || ' waitlist promotion',
      jsonb_build_object('event_id', p_event)
    );

    IF v_owner IS NOT NULL THEN
      PERFORM public.add_notification(
        v_owner,
        'event_waitlist_promoted',
        'Waitlist promotion',
        'A user was promoted from waitlist',
        jsonb_build_object('event_id', p_event, 'user_id', p_user)
      );
    END IF;

    -- Update attendee count
    PERFORM public.update_event_attendee_count(p_event);

    RETURN p_user;
  END IF;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.rpc_event_waitlist_promote(uuid, uuid) TO authenticated;
