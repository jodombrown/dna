-- EVENTS: add essentials
alter table public.events
  add column if not exists slug text unique,
  add column if not exists visibility text check (visibility in ('public','private','members')) default 'public',
  add column if not exists capacity integer,
  add column if not exists waitlist_enabled boolean default false,
  add column if not exists online_url text,
  add column if not exists location_json jsonb,
  add column if not exists theme text,
  add column if not exists calendar_id uuid;


-- TICKET TYPES
create table if not exists public.event_ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  name text not null,
  description text,
  payment_type text check (payment_type in ('free','paid','flex')) not null default 'free',
  price_cents integer,
  min_price_cents integer,
  suggested_price_cents integer,
  sales_start timestamptz,
  sales_end timestamptz,
  total_tickets integer,
  hidden boolean default false,
  require_approval boolean default false,
  created_at timestamptz default now()
);

-- RLS for event_ticket_types
alter table public.event_ticket_types enable row level security;
create policy ett_public_read on public.event_ticket_types for select using (true);
create policy ett_manage_owner_admin on public.event_ticket_types for insert with check (
  public.is_event_owner(event_id, (select auth.uid())) or public.is_admin_user((select auth.uid()))
);
create policy ett_update_owner_admin on public.event_ticket_types for update using (
  public.is_event_owner(event_id, (select auth.uid())) or public.is_admin_user((select auth.uid()))
) with check (
  public.is_event_owner(event_id, (select auth.uid())) or public.is_admin_user((select auth.uid()))
);
create policy ett_delete_owner_admin on public.event_ticket_types for delete using (
  public.is_event_owner(event_id, (select auth.uid())) or public.is_admin_user((select auth.uid()))
);


-- REGISTRATION QUESTIONS
create table if not exists public.event_registration_questions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  label text not null,
  type text check (type in ('text_short','text_long','options','company','checkbox','social','website','terms')) not null,
  required boolean default false,
  options jsonb,
  position int default 0,
  created_at timestamptz default now()
);

-- RLS for event_registration_questions
alter table public.event_registration_questions enable row level security;
create policy erq_public_read on public.event_registration_questions for select using (true);
create policy erq_manage_owner_admin on public.event_registration_questions for insert with check (
  public.is_event_owner(event_id, (select auth.uid())) or public.is_admin_user((select auth.uid()))
);
create policy erq_update_owner_admin on public.event_registration_questions for update using (
  public.is_event_owner(event_id, (select auth.uid())) or public.is_admin_user((select auth.uid()))
) with check (
  public.is_event_owner(event_id, (select auth.uid())) or public.is_admin_user((select auth.uid()))
);
create policy erq_delete_owner_admin on public.event_registration_questions for delete using (
  public.is_event_owner(event_id, (select auth.uid())) or public.is_admin_user((select auth.uid()))
);


-- REGISTRATIONS: extend
alter table public.event_registrations
  add column if not exists ticket_type_id uuid references public.event_ticket_types(id),
  add column if not exists status text check (status in ('pending','going','waitlist','declined','canceled')) default 'going',
  add column if not exists answers jsonb,
  add column if not exists price_paid_cents integer,
  add column if not exists currency text,
  add column if not exists join_token text unique;

-- Join token generator
create or replace function public.gen_join_token() returns trigger language plpgsql as $$
begin
  if new.join_token is null then
    new.join_token := encode(gen_random_bytes(16), 'hex');
  end if;
  return new;
end$$;

drop trigger if exists trg_event_registrations_join_token on public.event_registrations;
create trigger trg_event_registrations_join_token
before insert on public.event_registrations
for each row execute function public.gen_join_token();


-- CHECK-INS
create table if not exists public.event_checkins (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references public.event_registrations(id) on delete cascade,
  checked_in_at timestamptz default now(),
  by_profile_id uuid,
  unique (registration_id)
);

-- RLS for event_checkins
alter table public.event_checkins enable row level security;
create policy ec_select_self_or_owner_admin on public.event_checkins for select using (
  exists (
    select 1 from public.event_registrations er
    where er.id = registration_id and er.user_id = (select auth.uid())
  )
  or public.is_admin_user((select auth.uid()))
  or exists (
    select 1 from public.event_registrations er
    join public.events e on e.id = er.event_id
    where er.id = registration_id and public.is_event_owner(e.id, (select auth.uid()))
  )
);
create policy ec_insert_owner_admin on public.event_checkins for insert with check (
  exists (
    select 1 from public.event_registrations er
    join public.events e on e.id = er.event_id
    where er.id = registration_id and (public.is_event_owner(e.id, (select auth.uid())) or public.is_admin_user((select auth.uid())))
  )
);
create policy ec_update_owner_admin on public.event_checkins for update using (
  exists (
    select 1 from public.event_registrations er
    join public.events e on e.id = er.event_id
    where er.id = registration_id and (public.is_event_owner(e.id, (select auth.uid())) or public.is_admin_user((select auth.uid())))
  )
) with check (
  exists (
    select 1 from public.event_registrations er
    join public.events e on e.id = er.event_id
    where er.id = registration_id and (public.is_event_owner(e.id, (select auth.uid())) or public.is_admin_user((select auth.uid())))
  )
);
create policy ec_delete_owner_admin on public.event_checkins for delete using (
  exists (
    select 1 from public.event_registrations er
    join public.events e on e.id = er.event_id
    where er.id = registration_id and (public.is_event_owner(e.id, (select auth.uid())) or public.is_admin_user((select auth.uid())))
  )
);


-- BLASTS
create table if not exists public.event_blasts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  subject text not null,
  body_markdown text not null,
  segment jsonb,
  scheduled_for timestamptz,
  sent_at timestamptz
);

-- RLS for event_blasts
alter table public.event_blasts enable row level security;
create policy eb_owner_admin_read on public.event_blasts for select using (
  exists (select 1 from public.events e where e.id = event_id and (public.is_event_owner(e.id, (select auth.uid())) or public.is_admin_user((select auth.uid()))))
);
create policy eb_owner_admin_insert on public.event_blasts for insert with check (
  exists (select 1 from public.events e where e.id = event_id and (public.is_event_owner(e.id, (select auth.uid())) or public.is_admin_user((select auth.uid()))))
);
create policy eb_owner_admin_update on public.event_blasts for update using (
  exists (select 1 from public.events e where e.id = event_id and (public.is_event_owner(e.id, (select auth.uid())) or public.is_admin_user((select auth.uid()))))
) with check (
  exists (select 1 from public.events e where e.id = event_id and (public.is_event_owner(e.id, (select auth.uid())) or public.is_admin_user((select auth.uid()))))
);
create policy eb_owner_admin_delete on public.event_blasts for delete using (
  exists (select 1 from public.events e where e.id = event_id and (public.is_event_owner(e.id, (select auth.uid())) or public.is_admin_user((select auth.uid()))))
);


-- ANALYTICS
create table if not exists public.event_analytics (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  happened_at timestamptz default now(),
  kind text check (kind in ('page_view','utm','join_click')),
  payload jsonb
);

-- RLS for event_analytics
alter table public.event_analytics enable row level security;
create policy ea_public_insert on public.event_analytics for insert with check (true);
create policy ea_owner_admin_read on public.event_analytics for select using (
  exists (select 1 from public.events e where e.id = event_id and (public.is_event_owner(e.id, (select auth.uid())) or public.is_admin_user((select auth.uid()))))
);
