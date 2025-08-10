-- 1) Align status default to 'going' and recalc attendees
ALTER TABLE public.event_registrations
  ALTER COLUMN status SET DEFAULT 'going';

-- Backfill existing data
UPDATE public.event_registrations
SET status = 'going'
WHERE status = 'registered';

-- 2) Update attendee count function to count only 'going'
CREATE OR REPLACE FUNCTION public.update_event_attendee_count(p_event uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  update public.events e
  set attendee_count = (
    select count(*) from public.event_registrations r
    where r.event_id = p_event and r.status = 'going'
  )
  where e.id = p_event;
end; $$;

-- 3) Trigger to auto-generate immutable join_token
CREATE OR REPLACE FUNCTION public.set_event_registration_join_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  if NEW.join_token is null then
    NEW.join_token := encode(gen_random_bytes(8), 'hex');
  end if;
  return NEW;
end; $$;

DROP TRIGGER IF EXISTS trg_set_join_token ON public.event_registrations;
CREATE TRIGGER trg_set_join_token
BEFORE INSERT ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.set_event_registration_join_token();

-- Prevent updates to join_token (immutable)
CREATE OR REPLACE FUNCTION public.prevent_join_token_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  if NEW.join_token is distinct from OLD.join_token then
    raise exception 'join_token_immutable';
  end if;
  return NEW;
end; $$;

DROP TRIGGER IF EXISTS trg_prevent_join_token_update ON public.event_registrations;
CREATE TRIGGER trg_prevent_join_token_update
BEFORE UPDATE OF join_token ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.prevent_join_token_update();

-- Ensure quick lookup and uniqueness (allows multiple NULLs by default)
DO $$ BEGIN
  BEGIN
    ALTER TABLE public.event_registrations ADD CONSTRAINT event_registrations_join_token_key UNIQUE (join_token);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 4) RPC to resolve join token to event URL
CREATE OR REPLACE FUNCTION public.rpc_event_join_link(p_token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := (select auth.uid());
  v_event uuid;
  v_slug text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT r.event_id INTO v_event
  FROM public.event_registrations r
  WHERE r.join_token = p_token
    AND r.user_id = v_uid
    AND r.status = 'going'
  LIMIT 1;

  IF v_event IS NULL THEN
    RAISE EXCEPTION 'invalid_or_unauthorized';
  END IF;

  SELECT e.slug INTO v_slug FROM public.events e WHERE e.id = v_event;

  IF v_slug IS NOT NULL THEN
    RETURN '/events/' || v_slug;
  ELSE
    RETURN '/app/events/' || v_event::text;
  END IF;
END; $$;

-- 5) Extend rpc_event_register to accept answers/ticket and set status 'going'
CREATE OR REPLACE FUNCTION public.rpc_event_register(p_event uuid, p_answers jsonb DEFAULT '{}'::jsonb, p_ticket_type uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := (select auth.uid());
  v_max int;
  v_cnt int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT max_attendees INTO v_max FROM public.events WHERE id = p_event;
  IF v_max IS NOT NULL THEN
    SELECT count(*) INTO v_cnt FROM public.event_registrations WHERE event_id = p_event AND status = 'going';
    IF v_cnt >= v_max THEN
      RAISE EXCEPTION 'capacity_reached';
    END IF;
  END IF;

  INSERT INTO public.event_registrations(event_id, user_id, answers, ticket_type_id, status)
  VALUES (p_event, v_uid, NULLIF(p_answers, '{}'::jsonb), p_ticket_type, 'going')
  ON CONFLICT (event_id, user_id) DO NOTHING;

  -- Optional contribution log
  PERFORM public.rpc_log_contribution('event', p_event, NULL, jsonb_build_object('action','going'));
END; $$;

-- 6) Align payment_type naming to 'flex'
UPDATE public.event_ticket_types SET payment_type = 'flex' WHERE payment_type IN ('donation','Donation');