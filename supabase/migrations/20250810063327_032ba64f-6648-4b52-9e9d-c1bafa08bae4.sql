-- Ensure bucket exists
insert into storage.buckets (id, name, public)
values ('event-media','event-media', true)
on conflict (id) do nothing;

-- Create policies only if missing
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Event media public read'
  ) then
    execute $$create policy "Event media public read" on storage.objects
      for select to public using (bucket_id = 'event-media')$$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Event media users can upload own'
  ) then
    execute $$create policy "Event media users can upload own" on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'event-media' and (auth.uid())::text = (storage.foldername(name))[1]
      )$$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Event media users can update own'
  ) then
    execute $$create policy "Event media users can update own" on storage.objects
      for update to authenticated
      using (
        bucket_id = 'event-media' and (auth.uid())::text = (storage.foldername(name))[1]
      )
      with check (
        bucket_id = 'event-media' and (auth.uid())::text = (storage.foldername(name))[1]
      )$$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Event media users can delete own'
  ) then
    execute $$create policy "Event media users can delete own" on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'event-media' and (auth.uid())::text = (storage.foldername(name))[1]
      )$$;
  end if;
end$$;

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