-- Ensure bucket exists
insert into storage.buckets (id, name, public)
values ('event-media','event-media', true)
on conflict (id) do nothing;

-- Create policies only if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Event media public read'
  ) THEN
    EXECUTE 'CREATE POLICY "Event media public read" ON storage.objects FOR SELECT TO public USING (bucket_id = ''event-media'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Event media users can upload own'
  ) THEN
    EXECUTE 'CREATE POLICY "Event media users can upload own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''event-media'' AND (auth.uid())::text = (storage.foldername(name))[1])';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Event media users can update own'
  ) THEN
    EXECUTE 'CREATE POLICY "Event media users can update own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''event-media'' AND (auth.uid())::text = (storage.foldername(name))[1]) WITH CHECK (bucket_id = ''event-media'' AND (auth.uid())::text = (storage.foldername(name))[1])';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Event media users can delete own'
  ) THEN
    EXECUTE 'CREATE POLICY "Event media users can delete own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''event-media'' AND (auth.uid())::text = (storage.foldername(name))[1])';
  END IF;
END$$;

-- Capacity enforcement function (idempotent)
create or replace function public.rpc_event_register(p_event uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_max int;
  v_cnt int;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  select max_attendees into v_max from public.events where id = p_event;
  if v_max is not null then
    select count(*) into v_cnt from public.event_registrations where event_id = p_event and status = 'registered';
    if v_cnt >= v_max then
      raise exception 'capacity_reached';
    end if;
  end if;
  insert into public.event_registrations(event_id, user_id)
  values (p_event, v_uid)
  on conflict (event_id, user_id) do nothing;
end;
$$;
revoke all on function public.rpc_event_register(uuid) from public, anon;
grant execute on function public.rpc_event_register(uuid) to authenticated;

-- Sync attendee_count helpers
create or replace function public.update_event_attendee_count(p_event uuid)
returns void
language plpgsql
as $$
begin
  update public.events e
  set attendee_count = (
    select count(*) from public.event_registrations r
    where r.event_id = p_event and r.status = 'registered'
  )
  where e.id = p_event;
end;
$$;

create or replace function public._on_event_reg_change()
returns trigger
language plpgsql
as $$
begin
  perform public.update_event_attendee_count(case when TG_OP = 'DELETE' then OLD.event_id else NEW.event_id end);
  return null;
end;
$$;

drop trigger if exists trg_event_regs_after_ins on public.event_registrations;
create trigger trg_event_regs_after_ins
after insert on public.event_registrations
for each row execute function public._on_event_reg_change();

drop trigger if exists trg_event_regs_after_del on public.event_registrations;
create trigger trg_event_regs_after_del
after delete on public.event_registrations
for each row execute function public._on_event_reg_change();

drop trigger if exists trg_event_regs_after_upd_status on public.event_registrations;
create trigger trg_event_regs_after_upd_status
after update of status on public.event_registrations
for each row execute function public._on_event_reg_change();