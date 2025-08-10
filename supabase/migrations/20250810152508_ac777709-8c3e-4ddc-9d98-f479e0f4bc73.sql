-- Helper: is current user the owner of the event?
create or replace function public.is_event_owner(p_event uuid, p_user uuid)
returns boolean 
language sql 
stable 
security definer 
set search_path = public 
as $$
  select exists(
    select 1 from public.events e
    where e.id = p_event and e.created_by = p_user
  );
$$;

revoke all on function public.is_event_owner(uuid, uuid) from public, anon;
grant execute on function public.is_event_owner(uuid, uuid) to authenticated;

-- Secure RPC: return attendees for an event (owner or admin only)
create or replace function public.rpc_event_attendees(p_event uuid)
returns table(user_id uuid, username text, full_name text, registered_at timestamptz)
language plpgsql 
security definer 
set search_path = public 
as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if not ( public.is_admin_user(v_uid) or public.is_event_owner(p_event, v_uid) ) then
    raise exception 'forbidden';
  end if;
  return query
  select r.user_id,
         p.username,
         coalesce(p.full_name, p.username) as full_name,
         r.registered_at as registered_at
  from public.event_registrations r
  left join public.profiles p on p.id = r.user_id
  where r.event_id = p_event
  order by r.registered_at desc;
end; $$;

revoke all on function public.rpc_event_attendees(uuid) from public, anon;
grant execute on function public.rpc_event_attendees(uuid) to authenticated;
