-- Retry migration with function drop to adjust return type
-- Safe drop old set_connection_intention with void return
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public' AND p.proname='set_connection_intention' AND pg_get_function_identity_arguments(p.oid)='p_connection uuid, p_type text, p_notes text, p_visibility text'
  ) THEN
    DROP FUNCTION public.set_connection_intention(uuid, text, text, text);
  END IF;
END $$;

-- Re-apply schema changes and functions (idempotent where possible)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS impact_regions text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sdg_focus text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS offers text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS needs text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS available_hours_per_month int;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_contact text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS adin_mode text;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_adin_mode_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_adin_mode_check CHECK (adin_mode IS NULL OR adin_mode IN ('quiet','standard','builder'));
  END IF;
END $$;

ALTER TABLE public.connections ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE public.connections ADD COLUMN IF NOT EXISTS last_interaction_at timestamptz;
ALTER TABLE public.connections ADD COLUMN IF NOT EXISTS adin_health int DEFAULT 50;
ALTER TABLE public.connections ADD COLUMN IF NOT EXISTS adin_health_reason text;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='connections_status_check') THEN
    ALTER TABLE public.connections ADD CONSTRAINT connections_status_check CHECK (status IS NULL OR status IN ('requested','accepted','muted','archived','blocked'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='connection_intentions_type_check') THEN
    ALTER TABLE public.connection_intentions ADD CONSTRAINT connection_intentions_type_check CHECK (type IN ('get_acquainted','knowledge_exchange','mentor','partner_explore','co-build','investor_interest','other'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='connection_intentions_visibility_check') THEN
    ALTER TABLE public.connection_intentions ADD CONSTRAINT connection_intentions_visibility_check CHECK (visibility IN ('shared','private'));
  END IF;
END $$;

ALTER TABLE public.connection_preferences ADD COLUMN IF NOT EXISTS channels text[] DEFAULT '{inbox}'::text[];
ALTER TABLE public.connection_preferences ADD COLUMN IF NOT EXISTS next_review_at timestamptz;
ALTER TABLE public.connection_preferences ADD COLUMN IF NOT EXISTS snoozed_until timestamptz;
ALTER TABLE public.connection_preferences ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='connection_preferences_cadence_check') THEN
    ALTER TABLE public.connection_preferences ADD CONSTRAINT connection_preferences_cadence_check CHECK (nudge_cadence IN ('off','low','medium','high','quiet','standard','builder'));
  END IF;
END $$;

ALTER TABLE public.connection_events ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.connection_events ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='connection_events_type_check') THEN
    ALTER TABLE public.connection_events ADD CONSTRAINT connection_events_type_check CHECK (event_type IN ('message','share_resource','intro_made','attended_same_event','coauthored_post','task_completed','nudge_accepted','nudge_dismissed'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='adin_recommendations_type_check') THEN
    ALTER TABLE public.adin_recommendations ADD CONSTRAINT adin_recommendations_type_check CHECK (rec_type IN ('people','question','resource','event','microtask','collaborator'));
  END IF;
END $$;

ALTER TABLE public.adin_nudges ADD COLUMN IF NOT EXISTS payload jsonb;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='adin_nudges' AND column_name='created_at') THEN
    ALTER TABLE public.adin_nudges ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='adin_nudges_type_check') THEN
    ALTER TABLE public.adin_nudges ADD CONSTRAINT adin_nudges_type_check CHECK (nudge_type IN ('kickstart','checkin','suggest_event','suggest_resource','suggest_intro','microtask'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='adin_nudges_status_check') THEN
    ALTER TABLE public.adin_nudges ADD CONSTRAINT adin_nudges_status_check CHECK (status IN ('sent','accepted','dismissed','snoozed'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.impact_attributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL,
  source_event_id uuid,
  impact_type text,
  metric jsonb,
  verified_by uuid,
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_connection_participant(p_connection uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='public'
AS $$
  select exists (
    select 1 from public.connections c where c.id=p_connection and (c.a=auth.uid() or c.b=auth.uid())
  );
$$;

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connections' AND policyname='connections_select_participants') THEN
    CREATE POLICY "connections_select_participants" ON public.connections FOR SELECT USING (public.is_connection_participant(id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connections' AND policyname='connections_insert_participants') THEN
    CREATE POLICY "connections_insert_participants" ON public.connections FOR INSERT WITH CHECK ((a=auth.uid()) OR (b=auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connections' AND policyname='connections_update_participants') THEN
    CREATE POLICY "connections_update_participants" ON public.connections FOR UPDATE USING (public.is_connection_participant(id)) WITH CHECK (public.is_connection_participant(id));
  END IF;
END $$;

ALTER TABLE public.connection_intentions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connection_intentions' AND policyname='ci_select_participants') THEN
    CREATE POLICY "ci_select_participants" ON public.connection_intentions FOR SELECT USING (public.is_connection_participant(connection_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connection_intentions' AND policyname='ci_insert_owner_participant') THEN
    CREATE POLICY "ci_insert_owner_participant" ON public.connection_intentions FOR INSERT WITH CHECK (by_user=auth.uid() AND public.is_connection_participant(connection_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connection_intentions' AND policyname='ci_update_owner_participant') THEN
    CREATE POLICY "ci_update_owner_participant" ON public.connection_intentions FOR UPDATE USING (by_user=auth.uid() AND public.is_connection_participant(connection_id)) WITH CHECK (by_user=auth.uid() AND public.is_connection_participant(connection_id));
  END IF;
END $$;

ALTER TABLE public.connection_preferences ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connection_preferences' AND policyname='Prefs readable by owner') THEN
    CREATE POLICY "Prefs readable by owner" ON public.connection_preferences FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connection_preferences' AND policyname='Prefs insert by owner participant') THEN
    CREATE POLICY "Prefs insert by owner participant" ON public.connection_preferences FOR INSERT WITH CHECK (user_id = auth.uid() AND public.is_connection_participant(connection_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connection_preferences' AND policyname='Prefs update by owner participant') THEN
    CREATE POLICY "Prefs update by owner participant" ON public.connection_preferences FOR UPDATE USING (user_id = auth.uid() AND public.is_connection_participant(connection_id)) WITH CHECK (user_id = auth.uid() AND public.is_connection_participant(connection_id));
  END IF;
END $$;

ALTER TABLE public.connection_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connection_events' AND policyname='ce_select_participants') THEN
    CREATE POLICY "ce_select_participants" ON public.connection_events FOR SELECT USING (public.is_connection_participant(connection_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connection_events' AND policyname='ce_insert_participants') THEN
    CREATE POLICY "ce_insert_participants" ON public.connection_events FOR INSERT WITH CHECK (public.is_connection_participant(connection_id) AND actor = auth.uid());
  END IF;
END $$;

ALTER TABLE public.adin_recommendations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='adin_recommendations' AND policyname='ar_user_owned_select') THEN
    CREATE POLICY "ar_user_owned_select" ON public.adin_recommendations FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='adin_recommendations' AND policyname='ar_user_owned_insert') THEN
    CREATE POLICY "ar_user_owned_insert" ON public.adin_recommendations FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='adin_recommendations' AND policyname='ar_user_owned_update') THEN
    CREATE POLICY "ar_user_owned_update" ON public.adin_recommendations FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

ALTER TABLE public.adin_nudges ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='adin_nudges' AND policyname='Nudges readable by owner') THEN
    CREATE POLICY "Nudges readable by owner" ON public.adin_nudges FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='adin_nudges' AND policyname='System can insert nudges') THEN
    CREATE POLICY "System can insert nudges" ON public.adin_nudges FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='adin_nudges' AND policyname='Nudges update by owner') THEN
    CREATE POLICY "Nudges update by owner" ON public.adin_nudges FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

ALTER TABLE public.impact_attributions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='impact_attributions' AND policyname='ia_select_participants') THEN
    CREATE POLICY "ia_select_participants" ON public.impact_attributions FOR SELECT USING (public.is_connection_participant(connection_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='impact_attributions' AND policyname='ia_insert_participants') THEN
    CREATE POLICY "ia_insert_participants" ON public.impact_attributions FOR INSERT WITH CHECK (public.is_connection_participant(connection_id));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.ensure_connection(u1 uuid, u2 uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='public' AS $$
DECLARE v_id uuid; v_actor uuid := (select auth.uid());
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  IF u1 IS NULL OR u2 IS NULL OR u1 = u2 THEN RAISE EXCEPTION 'invalid users'; END IF;
  IF v_actor <> u1 AND v_actor <> u2 THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT id INTO v_id FROM public.connections WHERE (a=u1 AND b=u2) OR (a=u2 AND b=u1) LIMIT 1;
  IF v_id IS NULL THEN
    INSERT INTO public.connections(id, a, b, status, created_at, adin_health)
    VALUES (gen_random_uuid(), u1, u2, 'requested', now(), 50)
    RETURNING id INTO v_id;
  END IF;
  RETURN v_id;
END;$$;

CREATE OR REPLACE FUNCTION public.accept_connection(p_connection uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='public' AS $$
DECLARE v_actor uuid := (select auth.uid()); v_a uuid; v_b uuid; BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  IF NOT public.is_connection_participant(p_connection) THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT a, b INTO v_a, v_b FROM public.connections WHERE id = p_connection;
  UPDATE public.connections SET status='accepted', last_interaction_at=now() WHERE id = p_connection;
  INSERT INTO public.connection_preferences(connection_id, user_id, nudge_cadence) VALUES (p_connection, v_a, 'standard') ON CONFLICT (connection_id, user_id) DO NOTHING;
  INSERT INTO public.connection_preferences(connection_id, user_id, nudge_cadence) VALUES (p_connection, v_b, 'standard') ON CONFLICT (connection_id, user_id) DO NOTHING;
  INSERT INTO public.adin_nudges(user_id, connection_id, nudge_type, message, status, created_at) VALUES (v_a, p_connection, 'kickstart', 'Start this connection with a hello.', 'sent', now());
  INSERT INTO public.adin_nudges(user_id, connection_id, nudge_type, message, status, created_at) VALUES (v_b, p_connection, 'kickstart', 'Start this connection with a hello.', 'sent', now());
END;$$;

CREATE OR REPLACE FUNCTION public.set_connection_intention(p_connection uuid, p_type text, p_notes text DEFAULT NULL, p_visibility text DEFAULT 'shared')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='public' AS $$
DECLARE v_uid uuid := (select auth.uid()); v_id uuid := gen_random_uuid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF NOT public.is_connection_participant(p_connection) THEN RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO public.connection_intentions (id, connection_id, by_user, type, notes, visibility, created_at, target_outcome)
  VALUES (v_id, p_connection, v_uid, nullif(trim(p_type),''), nullif(trim(p_notes),''), CASE WHEN p_visibility IN ('shared','private') THEN p_visibility ELSE 'shared' END, now(), NULL);
  RETURN v_id;
END;$$;

CREATE OR REPLACE FUNCTION public.log_connection_event(p_connection uuid, p_event_type text, p_payload jsonb DEFAULT '{}'::jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='public' AS $$
DECLARE v_uid uuid := (select auth.uid()); v_id uuid := gen_random_uuid(); BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF NOT public.is_connection_participant(p_connection) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF p_event_type NOT IN ('message','share_resource','intro_made','attended_same_event','coauthored_post','task_completed','nudge_accepted','nudge_dismissed') THEN RAISE EXCEPTION 'invalid event type'; END IF;
  INSERT INTO public.connection_events(id, connection_id, actor, event_type, payload, created_at)
  VALUES (v_id, p_connection, v_uid, p_event_type, COALESCE(p_payload,'{}'::jsonb), now());
  RETURN v_id;
END;$$;

CREATE OR REPLACE FUNCTION public.resolve_nudge(p_nudge uuid, p_status text, p_snooze_until timestamptz DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='public' AS $$
DECLARE v_uid uuid := (select auth.uid()); v_conn uuid; BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF p_status NOT IN ('accepted','dismissed','snoozed') THEN RAISE EXCEPTION 'invalid status'; END IF;
  SELECT connection_id INTO v_conn FROM public.adin_nudges WHERE id = p_nudge AND user_id = v_uid;
  IF v_conn IS NULL THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.adin_nudges SET status = p_status, resolved_at = CASE WHEN p_status='snoozed' THEN NULL ELSE now() END WHERE id = p_nudge;
  IF p_status = 'snoozed' AND p_snooze_until IS NOT NULL THEN
    INSERT INTO public.connection_preferences (connection_id, user_id, nudge_cadence, snoozed_until, created_at)
    VALUES (v_conn, v_uid, 'standard', p_snooze_until, now())
    ON CONFLICT (connection_id, user_id) DO UPDATE SET snoozed_until = EXCLUDED.snoozed_until;
  END IF;
  IF p_status IN ('accepted','dismissed') THEN
    PERFORM public.log_connection_event(v_conn, CASE WHEN p_status='accepted' THEN 'nudge_accepted' ELSE 'nudge_dismissed' END, jsonb_build_object('nudge_id', p_nudge));
  END IF;
END;$$;

GRANT EXECUTE ON FUNCTION public.ensure_connection(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_connection(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_connection_intention(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_connection_event(uuid, text, jsonb) TO authenticated;