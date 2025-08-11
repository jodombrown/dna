-- Fix public_profile view types to match existing schema (skills: text[], links: jsonb)

-- Adjust default for links to an object for consistency (if jsonb)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='profiles' AND column_name='links' AND data_type='jsonb'
  ) THEN
    EXECUTE 'ALTER TABLE public.profiles ALTER COLUMN links SET DEFAULT ''{}''::jsonb';
  END IF;
END$$;

DROP VIEW IF EXISTS public.public_profile;
CREATE VIEW public.public_profile AS
SELECT
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.headline,
  p.location,
  p.org,
  COALESCE(p.links, '{}'::jsonb) AS links,
  COALESCE(p.skills, ARRAY[]::text[]) AS skills,
  p.bio
FROM public.profiles p
WHERE COALESCE(p.visibility->>'profile', 'public') = 'public';