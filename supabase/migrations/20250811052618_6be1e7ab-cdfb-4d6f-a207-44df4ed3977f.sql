-- Recreate public_profile view using is_public flag (no visibility dependency)
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
  jsonb_strip_nulls(jsonb_build_object(
    'linkedin', p.linkedin_url,
    'website', p.website_url
  )) AS links,
  COALESCE(p.skills, ARRAY[]::text[]) AS skills,
  p.bio
FROM public.profiles p
WHERE COALESCE(p.is_public, true) = true;