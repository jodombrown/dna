-- Fix seed to set created_by explicitly (auth.uid() is null in migration context)

-- Seed demo events
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

-- Seed demo opportunities via contribution_cards
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
