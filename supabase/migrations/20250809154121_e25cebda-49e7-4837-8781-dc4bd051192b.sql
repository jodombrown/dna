-- Create public storage buckets and least-privilege policies (idempotent)
-- Buckets
insert into storage.buckets (id, name, public) values
  ('avatars','avatars', true),
  ('banners','banners', true),
  ('post-images','post-images', true),
  ('user-posts','user-posts', true),
  ('profile-pictures','profile-pictures', true),
  ('profile-images','profile-images', true),
  ('event-images','event-images', true)
on conflict (id) do nothing;

-- Public read policies for public buckets
-- Avatars
drop policy if exists "public read avatars" on storage.objects;
create policy "public read avatars" on storage.objects
for select to public using (bucket_id = 'avatars');

-- Banners
drop policy if exists "public read banners" on storage.objects;
create policy "public read banners" on storage.objects
for select to public using (bucket_id = 'banners');

-- Post images (public read)
drop policy if exists "public read post-images" on storage.objects;
create policy "public read post-images" on storage.objects
for select to public using (bucket_id = 'post-images');

-- User posts (public read)
drop policy if exists "public read user-posts" on storage.objects;
create policy "public read user-posts" on storage.objects
for select to public using (bucket_id = 'user-posts');

-- Profile pictures (public read)
drop policy if exists "public read profile-pictures" on storage.objects;
create policy "public read profile-pictures" on storage.objects
for select to public using (bucket_id = 'profile-pictures');

-- Profile images (public read)
drop policy if exists "public read profile-images" on storage.objects;
create policy "public read profile-images" on storage.objects
for select to public using (bucket_id = 'profile-images');

-- Event images (public read)
drop policy if exists "public read event-images" on storage.objects;
create policy "public read event-images" on storage.objects
for select to public using (bucket_id = 'event-images');

-- Owner-scoped write/update/delete for each bucket
-- Helper: creates a triad of policies for a bucket
-- Avatars
drop policy if exists "owner write avatars" on storage.objects;
create policy "owner write avatars" on storage.objects
for insert to authenticated with check (
  bucket_id = 'avatars' and (select auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner update avatars" on storage.objects;
create policy "owner update avatars" on storage.objects
for update to authenticated using (
  bucket_id = 'avatars' and (select auth.uid())::text = split_part(name, '/', 1)
) with check (
  bucket_id = 'avatars' and (select auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner delete avatars" on storage.objects;
create policy "owner delete avatars" on storage.objects
for delete to authenticated using (
  bucket_id = 'avatars' and (select auth.uid())::text = split_part(name, '/', 1)
);

-- Banners
drop policy if exists "owner write banners" on storage.objects;
create policy "owner write banners" on storage.objects
for insert to authenticated with check (
  bucket_id = 'banners' and (select auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner update banners" on storage.objects;
create policy "owner update banners" on storage.objects
for update to authenticated using (
  bucket_id = 'banners' and (select auth.uid())::text = split_part(name, '/', 1)
) with check (
  bucket_id = 'banners' and (select auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner delete banners" on storage.objects;
create policy "owner delete banners" on storage.objects
for delete to authenticated using (
  bucket_id = 'banners' and (select auth.uid())::text = split_part(name, '/', 1)
);

-- Post images
drop policy if exists "owner write post-images" on storage.objects;
create policy "owner write post-images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'post-images' and (select auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner update post-images" on storage.objects;
create policy "owner update post-images" on storage.objects
for update to authenticated using (
  bucket_id = 'post-images' and (select auth.uid())::text = split_part(name, '/', 1)
) with check (
  bucket_id = 'post-images' and (select auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner delete post-images" on storage.objects;
create policy "owner delete post-images" on storage.objects
for delete to authenticated using (
  bucket_id = 'post-images' and (select auth.uid())::text = split_part(name, '/', 1)
);

-- User posts
drop policy if exists "owner write user-posts" on storage.objects;
create policy "owner write user-posts" on storage.objects
for insert to authenticated with check (
  bucket_id = 'user-posts' and (select auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner update user-posts" on storage.objects;
create policy "owner update user-posts" on storage.objects
for update to authenticated using (
  bucket_id = 'user-posts' and (select auth.uid())::text = split_part(name, '/', 1)
) with check (
  bucket_id = 'user-posts' and (select auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner delete user-posts" on storage.objects;
create policy "owner delete user-posts" on storage.objects
for delete to authenticated using (
  bucket_id = 'user-posts' and (select auth.uid())::text = split_part(name, '/', 1)
);

-- Profile pictures
drop policy if exists "owner write profile-pictures" on storage.objects;
create policy "owner write profile-pictures" on storage.objects
for insert to authenticated with check (
  bucket_id = 'profile-pictures' and (select auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner update profile-pictures" on storage.objects;
create policy "owner update profile-pictures" on storage.objects
for update to authenticated using (
  bucket_id = 'profile-pictures' and (select auth.uid())::text = split_part(name, '/', 1)
) with check (
  bucket_id = 'profile-pictures' and (select auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner delete profile-pictures" on storage.objects;
create policy "owner delete profile-pictures" on storage.objects
for delete to authenticated using (
  bucket_id = 'profile-pictures' and (select auth.uid())::text = split_part(name, '/', 1)
);

-- Profile images
drop policy if exists "owner write profile-images" on storage.objects;
create policy "owner write profile-images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'profile-images' and (select auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner update profile-images" on storage.objects;
create policy "owner update profile-images" on storage.objects
for update to authenticated using (
  bucket_id = 'profile-images' and (select auth.uid())::text = split_part(name, '/', 1)
) with check (
  bucket_id = 'profile-images' and (select auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner delete profile-images" on storage.objects;
create policy "owner delete profile-images" on storage.objects
for delete to authenticated using (
  bucket_id = 'profile-images' and (select auth.uid())::text = split_part(name, '/', 1)
);

-- Event images
drop policy if exists "owner write event-images" on storage.objects;
create policy "owner write event-images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'event-images' and (select auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner update event-images" on storage.objects;
create policy "owner update event-images" on storage.objects
for update to authenticated using (
  bucket_id = 'event-images' and (select auth.uid())::text = split_part(name, '/', 1)
) with check (
  bucket_id = 'event-images' and (select auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner delete event-images" on storage.objects;
create policy "owner delete event-images" on storage.objects
for delete to authenticated using (
  bucket_id = 'event-images' and (select auth.uid())::text = split_part(name, '/', 1)
);

-- Seed demo events (idempotent)
with creator as (
  select id from public.profiles limit 1
)
insert into public.events (id, created_by, title, description, date_time, location, type)
select gen_random_uuid(), coalesce((select id from creator), gen_random_uuid()), x.title, x.description, x.date_time, x.location, x.type
from (
  values
    ('Diaspora Innovation Forum', 'A virtual convening to showcase healthtech and fintech solutions from across the diaspora.', now() + interval '7 days', 'Virtual', 'conference'),
    ('Africa Tech Mixer Nairobi', 'In-person networking for founders and investors focused on East Africa.', now() + interval '14 days', 'Nairobi, Kenya', 'meetup'),
    ('Green Energy Microgrids AMA', 'Live Q&A with engineers deploying microgrids in West Africa.', now() + interval '20 days', 'Virtual', 'webinar'),
    ('Health Supply Chain Roundtable', 'Operational deep dive on last-mile logistics.', now() + interval '28 days', 'Accra, Ghana', 'roundtable'),
    ('Creative Economy Lab', 'Showcase for digital media ventures in the diaspora.', now() + interval '35 days', 'Lagos, Nigeria', 'showcase')
) as x(title, description, date_time, location, type)
where not exists (select 1 from public.events);

-- Seed demo opportunities via contribution_cards (idempotent)
with creator as (
  select id from public.profiles limit 1
)
insert into public.contribution_cards (id, created_by, title, description, contribution_type, status, impact_area, location)
select gen_random_uuid(), coalesce((select id from creator), gen_random_uuid()), x.title, x.description, x.contribution_type, 'active', x.impact_area, x.location
from (
  values
    ('Seed investment for SaaS in francophone Africa', 'Looking to co-lead a 300k round for B2B SaaS serving SMEs.', 'funding', 'Finance', 'Remote'),
    ('Mentor needed: health data interoperability', 'Support a pilot linking clinic EMRs to national systems.', 'mentorship', 'Health', 'Remote'),
    ('Grant: clean water initiative', 'Non-dilutive grant for community-scale filtration.', 'grant', 'Water', 'Ghana'),
    ('Job: Frontend React contractor', '3-month contract to ship dashboard UI.', 'job', 'Tech', 'Remote'),
    ('Partnership: university collaborators', 'Seeking faculty partners for a maker lab network.', 'general', 'Education', 'Kenya'),
    ('Mentorship: export logistics', 'Help a farmer collective navigate EU compliance.', 'mentorship', 'Agriculture', 'Nigeria'),
    ('Funding: climate fintech pre-seed', 'Ticket size 100k to 250k, strong data angle.', 'funding', 'Climate', 'Remote'),
    ('Job: Community manager', 'Build and moderate a pan-diaspora founder community.', 'job', 'Community', 'Hybrid')
) as x(title, description, contribution_type, impact_area, location)
where not exists (select 1 from public.contribution_cards);