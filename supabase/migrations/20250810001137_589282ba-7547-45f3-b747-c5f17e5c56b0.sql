-- Stabilize Events/Opportunities: schema normalization, RLS, indexes

-- 1) Events schema normalization
alter table public.events add column if not exists date_time timestamptz;

-- Backfill date_time from start_at if that column exists
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'start_at'
  ) then
    execute 'update public.events set date_time = coalesce(date_time, start_at) where date_time is null';
  end if;
end$$;

-- 2) Ensure created_by has default and is not null
alter table public.events alter column created_by set default auth.uid();
alter table public.events alter column created_by set not null;

-- 3) RLS for events
alter table public.events enable row level security;

-- Drop existing policies by known names (old and new) to avoid duplicates
-- Existing names
drop policy if exists "Authenticated users can create events" on public.events;
drop policy if exists "Events viewable by everyone" on public.events;
drop policy if exists "Users can delete own events" on public.events;
drop policy if exists "Users can update own events" on public.events;
-- This migration's names (if already present)
drop policy if exists "events_public_read" on public.events;
drop policy if exists "events_insert_self" on public.events;
drop policy if exists "events_update_own_or_admin" on public.events;
drop policy if exists "events_delete_own_or_admin" on public.events;

-- Everyone may read events
create policy "events_public_read" on public.events for select using (true);
-- Authenticated users can insert their own
create policy "events_insert_self" on public.events for insert to authenticated with check (created_by = auth.uid());
-- Authors or admins can update/delete
create policy "events_update_own_or_admin" on public.events for update to authenticated using (created_by = auth.uid() or public.is_admin_user(auth.uid())) with check (created_by = auth.uid() or public.is_admin_user(auth.uid()));
create policy "events_delete_own_or_admin" on public.events for delete to authenticated using (created_by = auth.uid() or public.is_admin_user(auth.uid()));

-- 4) RLS for contribution_cards (Opportunities)
alter table if exists public.contribution_cards enable row level security;

-- Drop existing policies by known names (old and new)
drop policy if exists "Active contribution cards are viewable by everyone" on public.contribution_cards;
drop policy if exists "Users can delete their own contribution cards" on public.contribution_cards;
drop policy if exists "Users can insert their own contribution cards" on public.contribution_cards;
drop policy if exists "Users can update their own contribution cards" on public.contribution_cards;

drop policy if exists "cards_public_read_active" on public.contribution_cards;
drop policy if exists "cards_insert_self" on public.contribution_cards;
drop policy if exists "cards_update_own_or_admin" on public.contribution_cards;
drop policy if exists "cards_delete_own_or_admin" on public.contribution_cards;

-- Read all cards (optionally constrain to status='active' later if needed)
create policy "cards_public_read_active" on public.contribution_cards for select using (true);
-- Authenticated users can create their own
create policy "cards_insert_self" on public.contribution_cards for insert to authenticated with check (created_by = auth.uid());
-- Authors or admins can update/delete
create policy "cards_update_own_or_admin" on public.contribution_cards for update to authenticated using (created_by = auth.uid() or public.is_admin_user(auth.uid())) with check (created_by = auth.uid() or public.is_admin_user(auth.uid()));
create policy "cards_delete_own_or_admin" on public.contribution_cards for delete to authenticated using (created_by = auth.uid() or public.is_admin_user(auth.uid()));

-- 5) Helpful indexes
create index if not exists idx_events_date_time on public.events (date_time desc);
create index if not exists idx_cards_created_at on public.contribution_cards (created_at desc);
create index if not exists idx_cards_type_status on public.contribution_cards (contribution_type, status);
