-- Ensure unique per (event_id, user_id)
create unique index if not exists idx_event_regs_event_user on public.event_registrations(event_id, user_id);

-- Register current user to an event
create or replace function public.rpc_event_register(p_event uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  insert into public.event_registrations(event_id, user_id)
  values (p_event, v_uid)
  on conflict (event_id, user_id) do nothing;
end;
$$;
revoke all on function public.rpc_event_register(uuid) from public, anon;
grant execute on function public.rpc_event_register(uuid) to authenticated;

-- Unregister current user from an event
create or replace function public.rpc_event_unregister(p_event uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  delete from public.event_registrations
  where event_id = p_event
    and user_id = v_uid;
end;
$$;
revoke all on function public.rpc_event_unregister(uuid) from public, anon;
grant execute on function public.rpc_event_unregister(uuid) to authenticated;

-- Public attendee count (no PII)
create or replace function public.rpc_event_attendee_count(p_event uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.event_registrations where event_id = p_event;
$$;
revoke all on function public.rpc_event_attendee_count(uuid) from public, anon;
-- Allow public to read counts safely
grant execute on function public.rpc_event_attendee_count(uuid) to public;