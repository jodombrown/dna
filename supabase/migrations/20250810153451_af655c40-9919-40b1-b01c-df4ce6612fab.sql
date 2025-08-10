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
  -- Optional ADIN: log contribution (safe, SECURITY DEFINER)
  perform public.rpc_log_contribution('event', p_event, NULL, jsonb_build_object('action','registered'));
end;
$$;

revoke all on function public.rpc_event_register(uuid) from public, anon;
grant execute on function public.rpc_event_register(uuid) to authenticated;