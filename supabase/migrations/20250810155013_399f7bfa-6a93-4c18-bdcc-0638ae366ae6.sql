-- 1) Notifications RPCs (robust, schema-adaptive) with search_path and performance-friendly auth UID
create or replace function public.rpc_notifications_list(p_limit integer default 50, p_offset integer default 0)
returns table(id uuid, title text, body text, metadata jsonb, created_at timestamptz, read_at timestamptz)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  has_title boolean;
  has_body boolean;
  has_metadata boolean;
  has_payload boolean;
  has_created_at boolean;
  has_read_at boolean;
  has_is_read boolean;
  has_updated_at boolean;
  sql text;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;

  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='title') into has_title;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='body') into has_body;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='metadata') into has_metadata;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='payload') into has_payload;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='created_at') into has_created_at;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='read_at') into has_read_at;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='is_read') into has_is_read;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='updated_at') into has_updated_at;

  sql := 'select n.id, '
    || (case when has_title then 'n.title' else 'NULL::text' end) || ' as title, '
    || (case when has_body then 'n.body' else 'NULL::text' end) || ' as body, '
    || (case when has_metadata then 'n.metadata' else (case when has_payload then 'n.payload' else '''{}''::jsonb' end) end) || ' as metadata, '
    || (case when has_created_at then 'n.created_at' else 'now()' end) || ' as created_at, '
    || (case when has_read_at then 'n.read_at'
        when has_is_read and has_updated_at then 'case when n.is_read then n.updated_at else null end'
        when has_is_read and has_created_at then 'case when n.is_read then n.created_at else null end'
        else 'NULL::timestamptz' end) || ' as read_at '
    || 'from public.notifications n '
    || 'where n.user_id = (select auth.uid()) '
    || 'order by ' || (case when has_created_at then 'n.created_at' else 'n.id' end) || ' desc '
    || 'limit $1 offset $2';

  return query execute sql using greatest(p_limit, 0), greatest(p_offset, 0);
end; $$;

revoke all on function public.rpc_notifications_list(int, int) from public, anon;
grant execute on function public.rpc_notifications_list(int, int) to authenticated;

-- Mark specific notifications as read; returns number updated
create or replace function public.rpc_notifications_mark_read(p_ids uuid[])
returns integer language plpgsql security definer set search_path to 'public' as $$
declare
  has_read_at boolean;
  has_is_read boolean;
  has_updated_at boolean;
  v_cnt int;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;

  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='read_at') into has_read_at;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='is_read') into has_is_read;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='updated_at') into has_updated_at;

  if has_read_at then
    update public.notifications
    set read_at = coalesce(read_at, now())
    where user_id = (select auth.uid())
      and id = any(p_ids);
  elsif has_is_read then
    if has_updated_at then
      update public.notifications
      set is_read = true, updated_at = now()
      where user_id = (select auth.uid())
        and id = any(p_ids)
        and coalesce(is_read,false) is not true;
    else
      update public.notifications
      set is_read = true
      where user_id = (select auth.uid())
        and id = any(p_ids)
        and coalesce(is_read,false) is not true;
    end if;
  else
    update public.notifications
    set updated_at = now()
    where user_id = (select auth.uid())
      and id = any(p_ids);
  end if;

  get diagnostics v_cnt = row_count;
  return v_cnt;
end; $$;

revoke all on function public.rpc_notifications_mark_read(uuid[]) from public, anon;
grant execute on function public.rpc_notifications_mark_read(uuid[]) to authenticated;

-- Mark all as read; returns number updated
create or replace function public.rpc_notifications_mark_all_read()
returns integer language plpgsql security definer set search_path to 'public' as $$
declare
  has_read_at boolean;
  has_is_read boolean;
  has_updated_at boolean;
  v_cnt int;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;

  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='read_at') into has_read_at;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='is_read') into has_is_read;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='updated_at') into has_updated_at;

  if has_read_at then
    update public.notifications
    set read_at = coalesce(read_at, now())
    where user_id = (select auth.uid())
      and read_at is null;
  elsif has_is_read then
    if has_updated_at then
      update public.notifications
      set is_read = true, updated_at = now()
      where user_id = (select auth.uid())
        and coalesce(is_read,false) is not true;
    else
      update public.notifications
      set is_read = true
      where user_id = (select auth.uid())
        and coalesce(is_read,false) is not true;
    end if;
  else
    update public.notifications
    set updated_at = now()
    where user_id = (select auth.uid());
  end if;

  get diagnostics v_cnt = row_count;
  return v_cnt;
end; $$;

revoke all on function public.rpc_notifications_mark_all_read() from public, anon;
grant execute on function public.rpc_notifications_mark_all_read() to authenticated;

-- 2) Fix RLS policy performance by wrapping auth.uid() in SELECT
-- Events
alter policy "events_delete_own_or_admin" on public.events
  using ((created_by = (select auth.uid())) or is_admin_user((select auth.uid())));
alter policy "events_insert_self" on public.events
  with check (created_by = (select auth.uid()));
alter policy "events_update_own_or_admin" on public.events
  using ((created_by = (select auth.uid())) or is_admin_user((select auth.uid())))
  with check ((created_by = (select auth.uid())) or is_admin_user((select auth.uid())));

-- Contribution cards
alter policy "cards_delete_own_or_admin" on public.contribution_cards
  using ((created_by = (select auth.uid())) or is_admin_user((select auth.uid())));
alter policy "cards_insert_self" on public.contribution_cards
  with check (created_by = (select auth.uid()));
alter policy "cards_update_own_or_admin" on public.contribution_cards
  using ((created_by = (select auth.uid())) or is_admin_user((select auth.uid())))
  with check ((created_by = (select auth.uid())) or is_admin_user((select auth.uid())));

-- Notifications (policy names inferred from linter/well-known names)
-- If these do not exist, the ALTER will error; guard with DO block
DO $$
BEGIN
  BEGIN
    EXECUTE 'alter policy "Users can update their own notifications" on public.notifications using (user_id = (select auth.uid()))';
  EXCEPTION WHEN undefined_object THEN
    -- ignore if policy not present
    NULL;
  END;
  BEGIN
    EXECUTE 'alter policy "Users can view their own notifications" on public.notifications using (user_id = (select auth.uid()))';
  EXCEPTION WHEN undefined_object THEN
    NULL;
  END;
END$$;

-- 3) Security: set search_path on functions flagged by linter
create or replace function public.update_event_attendee_count(p_event uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  update public.events e
  set attendee_count = (
    select count(*) from public.event_registrations r
    where r.event_id = p_event and r.status = 'registered'
  )
  where e.id = p_event;
end; $$;

create or replace function public._on_event_reg_change()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  perform public.update_event_attendee_count(case when TG_OP = 'DELETE' then OLD.event_id else NEW.event_id end);
  return null;
end; $$;

-- 4) Optional robustness: ensure profile exists for event creator to avoid FKey errors
create or replace function public.ensure_profile_for_user(p_user uuid, p_email text default null)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if p_user is null then return; end if;
  if not exists (select 1 from public.profiles where id = p_user) then
    insert into public.profiles(id, email, is_public)
    values (p_user, p_email, true)
    on conflict (id) do nothing;
  end if;
end; $$;

create or replace function public.trg_events_ensure_profile()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  perform public.ensure_profile_for_user(coalesce(NEW.created_by, (select auth.uid())), null);
  return NEW;
end; $$;

-- Create trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'events' AND t.tgname = 'before_events_ensure_profile'
  ) THEN
    CREATE TRIGGER before_events_ensure_profile
    BEFORE INSERT ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.trg_events_ensure_profile();
  END IF;
END$$;