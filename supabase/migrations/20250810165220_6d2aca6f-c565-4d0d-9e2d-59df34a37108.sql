-- Register with capacity & waitlist
create or replace function public.rpc_event_register(
  p_event uuid, p_ticket uuid, p_profile uuid, p_answers jsonb default '{}'::jsonb
) returns uuid
language plpgsql security definer as $$
declare
  v_capacity int; v_waitlist bool; v_require_approval bool;
  v_status text; v_count int; v_id uuid;
begin
  select capacity, waitlist_enabled into v_capacity, v_waitlist from public.events where id = p_event;
  select require_approval into v_require_approval from public.event_ticket_types where id = p_ticket;

  select count(*) into v_count from public.event_registrations
    where event_id = p_event and status = 'going';

  if v_capacity is not null and v_count >= v_capacity then
    if coalesce(v_waitlist, false) then v_status := 'waitlist';
    else raise exception 'Event is at capacity';
    end if;
  else
    v_status := case when v_require_approval then 'pending' else 'going' end;
  end if;

  insert into public.event_registrations(event_id, ticket_type_id, user_id, status, answers)
  values (p_event, p_ticket, p_profile, v_status, p_answers)
  returning id into v_id;

  return v_id;
end$$;

-- Approve / Decline
create or replace function public.rpc_event_approve(p_registration uuid) returns void
language sql security definer as $$
  update public.event_registrations set status='going' where id=p_registration;
$$;

create or replace function public.rpc_event_decline(p_registration uuid) returns void
language sql security definer as $$
  update public.event_registrations set status='declined' where id=p_registration;
$$;

-- Resolve join link + track analytics
create or replace function public.rpc_event_join_link(p_token text) returns text
language plpgsql security definer as $$
declare v_url text; v_event uuid;
begin
  select e.online_url, e.id into v_url, v_event
  from public.event_registrations r join public.events e on e.id=r.event_id
  where r.join_token=p_token and r.status in ('going','pending');
  if v_url is null then raise exception 'Invalid or unauthorized'; end if;

  insert into public.event_analytics(event_id, kind, payload) values (v_event, 'join_click', jsonb_build_object('token', p_token));
  return v_url;
end$$;