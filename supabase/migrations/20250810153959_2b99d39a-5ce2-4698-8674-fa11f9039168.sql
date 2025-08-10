-- 1) Waitlist table
create table if not exists public.event_waitlist (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null,
  position int not null,
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);
create index if not exists idx_event_waitlist_event on public.event_waitlist(event_id);
create index if not exists idx_event_waitlist_event_pos on public.event_waitlist(event_id, position);

alter table public.event_waitlist enable row level security;

-- RLS: users can see their own entry; admins and event owner can see all
create policy "wl_select_self_or_owner_admin" on public.event_waitlist
for select to authenticated using (
  user_id = (select auth.uid())
  or public.is_admin_user((select auth.uid()))
  or public.is_event_owner(event_id, (select auth.uid()))
);
create policy "wl_insert_self" on public.event_waitlist
for insert to authenticated with check (
  user_id = (select auth.uid())
);
create policy "wl_delete_self_or_owner_admin" on public.event_waitlist
for delete to authenticated using (
  user_id = (select auth.uid())
  or public.is_admin_user((select auth.uid()))
  or public.is_event_owner(event_id, (select auth.uid()))
);

-- 2) Notifications helper insert (tolerant to schema)
create or replace function public.add_notification(p_user uuid, p_type text, p_title text, p_body text, p_meta jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  -- Try rich insert shape
  begin
    insert into public.notifications(user_id, type, title, body, related_entity_id, related_entity_type, is_read, created_at, updated_at)
    values (p_user, p_type, p_title, p_body, null, null, false, now(), now());
  exception when undefined_table or undefined_column then
    -- Fallback minimal shape if schema differs
    begin
      insert into public.notifications(user_id, type, title, body)
      values (p_user, p_type, p_title, p_body);
    exception when others then
      -- swallow to avoid blocking main flows
      null;
    end;
  end;
end; $$;
revoke all on function public.add_notification(uuid, text, text, text, jsonb) from public, anon;
grant execute on function public.add_notification(uuid, text, text, text, jsonb) to authenticated;

-- 3) Get event owner
create or replace function public.event_owner_id(p_event uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select created_by from public.events where id = p_event;
$$;
revoke all on function public.event_owner_id(uuid) from public, anon;
grant execute on function public.event_owner_id(uuid) to authenticated;

-- 4) Join waitlist RPC
create or replace function public.rpc_event_join_waitlist(p_event uuid)
returns integer
language plpgsql security definer set search_path = public
as $$
declare v_uid uuid := (select auth.uid()); v_pos int; v_owner uuid; v_title text; begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  -- next position
  select coalesce(max(position), 0) + 1 into v_pos from public.event_waitlist where event_id = p_event;
  insert into public.event_waitlist(event_id, user_id, position) values(p_event, v_uid, v_pos)
  on conflict (event_id, user_id) do nothing;
  -- notify host
  select public.event_owner_id(p_event), title into v_owner, v_title from public.events where id = p_event;
  if v_owner is not null then
    perform public.add_notification(v_owner, 'event_waitlist_join', 'Waitlist joined', coalesce(v_title,'Event') || ' waitlist joined', jsonb_build_object('event_id', p_event, 'user_id', v_uid));
  end if;
  return v_pos;
end; $$;
revoke all on function public.rpc_event_join_waitlist(uuid) from public, anon;
grant execute on function public.rpc_event_join_waitlist(uuid) to authenticated;

-- 5) Promotion helper: move first-in-line from waitlist to registrations
create or replace function public.promote_from_waitlist(p_event uuid)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare v_uid uuid; v_owner uuid; v_title text; begin
  select user_id into v_uid
  from public.event_waitlist
  where event_id = p_event
  order by position asc, created_at asc
  limit 1;

  if v_uid is null then
    return null; -- nobody waiting
  end if;

  -- register user if not already registered
  insert into public.event_registrations(event_id, user_id)
  values (p_event, v_uid)
  on conflict (event_id, user_id) do nothing;
  -- remove from waitlist
  delete from public.event_waitlist where event_id = p_event and user_id = v_uid;
  -- notify promoted user and host
  select public.event_owner_id(p_event), title into v_owner, v_title from public.events where id = p_event;
  perform public.add_notification(v_uid, 'event_waitlist_promoted', 'You have a spot', 'You were promoted from the waitlist', jsonb_build_object('event_id', p_event));
  if v_owner is not null then
    perform public.add_notification(v_owner, 'event_waitlist_promoted', 'Waitlist promotion', 'A user was promoted from waitlist', jsonb_build_object('event_id', p_event, 'user_id', v_uid));
  end if;
  return v_uid;
end; $$;
revoke all on function public.promote_from_waitlist(uuid) from public, anon;
grant execute on function public.promote_from_waitlist(uuid) to authenticated;

-- 6) Trigger: on cancellation, try to promote next
create or replace function public.trg_event_reg_cancel_promote()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.promote_from_waitlist(old.event_id);
  return old;
end; $$;

drop trigger if exists trg_event_reg_cancel_promote on public.event_registrations;
create trigger trg_event_reg_cancel_promote after delete on public.event_registrations
for each row execute function public.trg_event_reg_cancel_promote();