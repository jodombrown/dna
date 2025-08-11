-- Fix public_profile view: alias company as org
DROP VIEW IF EXISTS public.public_profile;
CREATE VIEW public.public_profile AS
SELECT
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.headline,
  p.location,
  p.company AS org,
  COALESCE(p.links, '{}'::jsonb) AS links,
  COALESCE(p.skills, ARRAY[]::text[]) AS skills,
  p.bio
FROM public.profiles p
WHERE COALESCE(p.visibility->>'profile', 'public') = 'public';