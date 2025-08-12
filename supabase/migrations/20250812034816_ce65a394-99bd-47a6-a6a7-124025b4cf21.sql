-- Helper: check if user participates in a connection
CREATE OR REPLACE FUNCTION public.is_participant_of_connection(p_connection uuid, p_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.connections c
    where c.id = p_connection and (c.a = p_user or c.b = p_user)
  );
$function$;

-- RPC: set_connection_intention
CREATE OR REPLACE FUNCTION public.set_connection_intention(
  p_connection uuid,
  p_type text,
  p_notes text DEFAULT NULL,
  p_visibility text DEFAULT 'shared'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if not public.is_participant_of_connection(p_connection, v_uid) then raise exception 'forbidden'; end if;

  insert into public.connection_intentions (
    connection_id, by_user, type, notes, visibility, created_at, target_outcome
  ) values (
    p_connection,
    v_uid,
    nullif(trim(p_type),''),
    nullif(trim(p_notes),''),
    case when p_visibility in ('shared','private') then p_visibility else 'shared' end,
    now(),
    null
  );
end;
$function$;

-- RPC: resolve_nudge
CREATE OR REPLACE FUNCTION public.resolve_nudge(
  p_nudge uuid,
  p_status text,
  p_snooze_until timestamptz DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := (select auth.uid());
  v_conn uuid;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if p_status not in ('accepted','dismissed','snoozed') then raise exception 'invalid status'; end if;

  select connection_id into v_conn from public.adin_nudges where id = p_nudge and user_id = v_uid;
  if v_conn is null then raise exception 'forbidden'; end if;

  update public.adin_nudges
    set status = p_status,
        resolved_at = case when p_status = 'snoozed' then null else now() end
  where id = p_nudge;

  if p_status = 'snoozed' and p_snooze_until is not null then
    insert into public.connection_preferences (connection_id, user_id, nudge_cadence, snoozed_until, created_at)
    values (v_conn, v_uid, 'standard', p_snooze_until, now())
    on conflict (connection_id, user_id) do update
      set snoozed_until = excluded.snoozed_until;
  end if;
end;
$function$;

-- Ensure unique constraint for preferences upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='connection_preferences_connection_user_key'
  ) THEN
    ALTER TABLE public.connection_preferences
      ADD CONSTRAINT connection_preferences_connection_user_key UNIQUE (connection_id, user_id);
  END IF;
END$$;

-- Enable RLS and add minimal policies
ALTER TABLE public.connection_intentions ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connection_intentions' AND policyname='Intentions readable by owner or shared to participants'
  ) THEN
    CREATE POLICY "Intentions readable by owner or shared to participants"
    ON public.connection_intentions
    FOR SELECT
    USING (
      by_user = auth.uid()
      OR (visibility = 'shared' AND public.is_participant_of_connection(connection_id, auth.uid()))
    );
  END IF;
END$$;

ALTER TABLE public.connection_preferences ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connection_preferences' AND policyname='Prefs readable by owner'
  ) THEN
    CREATE POLICY "Prefs readable by owner"
    ON public.connection_preferences
    FOR SELECT
    USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connection_preferences' AND policyname='Prefs insert by owner participant'
  ) THEN
    CREATE POLICY "Prefs insert by owner participant"
    ON public.connection_preferences
    FOR INSERT
    WITH CHECK (user_id = auth.uid() AND public.is_participant_of_connection(connection_id, auth.uid()))
    ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connection_preferences' AND policyname='Prefs update by owner participant'
  ) THEN
    CREATE POLICY "Prefs update by owner participant"
    ON public.connection_preferences
    FOR UPDATE
    USING (user_id = auth.uid() AND public.is_participant_of_connection(connection_id, auth.uid()))
    WITH CHECK (user_id = auth.uid() AND public.is_participant_of_connection(connection_id, auth.uid()));
  END IF;
END$$;

ALTER TABLE public.adin_nudges ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='adin_nudges' AND policyname='Nudges readable by owner'
  ) THEN
    CREATE POLICY "Nudges readable by owner"
    ON public.adin_nudges
    FOR SELECT
    USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='adin_nudges' AND policyname='System can insert nudges'
  ) THEN
    CREATE POLICY "System can insert nudges"
    ON public.adin_nudges
    FOR INSERT
    WITH CHECK (true);
  END IF;
END$$;

-- Grant execute to authenticated
GRANT EXECUTE ON FUNCTION public.set_connection_intention(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_nudge(uuid, text, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_participant_of_connection(uuid, uuid) TO authenticated;