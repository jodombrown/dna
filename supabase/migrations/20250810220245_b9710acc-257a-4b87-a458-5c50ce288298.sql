-- QR check-in + analytics enhancements
-- 1) Generate short join token for registrations
CREATE OR REPLACE FUNCTION public.generate_join_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_token text;
BEGIN
  -- 10-char uppercase token, avoiding ambiguous chars
  v_token := upper(replace(replace(encode(gen_random_bytes(6), 'hex'), '-', ''), '_', ''));
  RETURN substr(v_token, 1, 10);
END;
$$;

-- 2) Trigger to set join_token on insert when missing
CREATE OR REPLACE FUNCTION public.trg_set_join_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.join_token IS NULL OR length(trim(NEW.join_token)) = 0 THEN
    NEW.join_token := public.generate_join_token();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_join_token_before_insert ON public.event_registrations;
CREATE TRIGGER set_join_token_before_insert
BEFORE INSERT ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.trg_set_join_token();

-- 3) Ensure uniqueness to prevent duplicate tokens and check-ins
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_event_registrations_join_token_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_event_registrations_join_token_unique
    ON public.event_registrations(join_token) WHERE join_token IS NOT NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_event_checkins_registration_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_event_checkins_registration_unique
    ON public.event_checkins(registration_id);
  END IF;
END $$;

-- 4) RPC to check-in by token (owner/admin only)
CREATE OR REPLACE FUNCTION public.rpc_check_in_by_token(p_event uuid, p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_reg_id uuid;
  v_checkin_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT (public.is_event_owner(p_event, v_uid) OR public.is_admin_user(v_uid)) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT id INTO v_reg_id
  FROM public.event_registrations
  WHERE event_id = p_event AND join_token = nullif(trim(p_token), '');

  IF v_reg_id IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  INSERT INTO public.event_checkins (registration_id, by_profile_id)
  VALUES (v_reg_id, v_uid)
  ON CONFLICT (registration_id) DO NOTHING
  RETURNING id INTO v_checkin_id;

  RETURN jsonb_build_object('registration_id', v_reg_id, 'checkin_id', v_checkin_id);
END;
$$;

-- 5) Helpful index for analytics
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_event_analytics_event_time'
  ) THEN
    CREATE INDEX idx_event_analytics_event_time ON public.event_analytics(event_id, happened_at);
  END IF;
END $$;