-- Create public storage buckets and policies (idempotent)
-- Buckets
insert into storage.buckets (id, name, public)
values ('avatars','avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('banners','banners', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('post-images','post-images', false)
on conflict (id) do nothing;

-- Policies: public read for avatars/banners
drop policy if exists "public read avatars" on storage.objects;
create policy "public read avatars" on storage.objects
for select to public
using (bucket_id = 'avatars');

drop policy if exists "public read banners" on storage.objects;
create policy "public read banners" on storage.objects
for select to public
using (bucket_id = 'banners');

-- Write/update/delete only by owner folder prefix auth.uid()/...
-- Avatars
drop policy if exists "owner write avatars" on storage.objects;
create policy "owner write avatars" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'avatars' and (auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner update avatars" on storage.objects;
create policy "owner update avatars" on storage.objects
for update to authenticated
using (
  bucket_id = 'avatars' and (auth.uid())::text = split_part(name, '/', 1)
)
with check (
  bucket_id = 'avatars' and (auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner delete avatars" on storage.objects;
create policy "owner delete avatars" on storage.objects
for delete to authenticated
using (
  bucket_id = 'avatars' and (auth.uid())::text = split_part(name, '/', 1)
);

-- Banners
drop policy if exists "owner write banners" on storage.objects;
create policy "owner write banners" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'banners' and (auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner update banners" on storage.objects;
create policy "owner update banners" on storage.objects
for update to authenticated
using (
  bucket_id = 'banners' and (auth.uid())::text = split_part(name, '/', 1)
)
with check (
  bucket_id = 'banners' and (auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner delete banners" on storage.objects;
create policy "owner delete banners" on storage.objects
for delete to authenticated
using (
  bucket_id = 'banners' and (auth.uid())::text = split_part(name, '/', 1)
);

-- Post images (no public read)
drop policy if exists "owner write post-images" on storage.objects;
create policy "owner write post-images" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'post-images' and (auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner update post-images" on storage.objects;
create policy "owner update post-images" on storage.objects
for update to authenticated
using (
  bucket_id = 'post-images' and (auth.uid())::text = split_part(name, '/', 1)
)
with check (
  bucket_id = 'post-images' and (auth.uid())::text = split_part(name, '/', 1)
);

drop policy if exists "owner delete post-images" on storage.objects;
create policy "owner delete post-images" on storage.objects
for delete to authenticated
using (
  bucket_id = 'post-images' and (auth.uid())::text = split_part(name, '/', 1)
);

-- Seed demo events into public.events if empty (align with existing schema)
insert into public.events (id, title, description, date_time, location, type)
select gen_random_uuid(), x.title, x.description, x.date_time, x.location, x.type
from (
  values
    ('Diaspora Innovation Forum', 'A virtual convening to showcase healthtech and fintech solutions from across the diaspora.', now() + interval '7 days', 'Virtual', 'conference'),
    ('Africa Tech Mixer Nairobi', 'In-person networking for founders and investors focused on East Africa.', now() + interval '14 days', 'Nairobi, Kenya', 'meetup'),
    ('Green Energy Microgrids AMA', 'Live Q&A with engineers deploying microgrids in West Africa.', now() + interval '20 days', 'Virtual', 'webinar'),
    ('Health Supply Chain Roundtable', 'Operational deep dive on last-mile logistics.', now() + interval '28 days', 'Accra, Ghana', 'roundtable'),
    ('Creative Economy Lab', 'Showcase for digital media ventures in the diaspora.', now() + interval '35 days', 'Lagos, Nigeria', 'showcase')
) as x(title, description, date_time, location, type)
where not exists (select 1 from public.events);

-- Seed demo opportunities via contribution_cards if empty
insert into public.contribution_cards (id, created_by, title, description, contribution_type, status, impact_area, location)
select gen_random_uuid(), auth.uid(), x.title, x.description, x.contribution_type, 'active', x.impact_area, x.location
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
