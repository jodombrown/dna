-- Retry migration with plain CREATE VIEW (no SECURITY clause)

-- 1) Profiles required columns (safe add)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS middle_initial text CHECK (char_length(middle_initial) <= 1),
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS org text,
  ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS links jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS visibility jsonb DEFAULT '{}'::jsonb;

-- Unique index for username (allow NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx
  ON public.profiles (username)
  WHERE username IS NOT NULL;

-- 2) Onboarding progress table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  percent int NOT NULL DEFAULT 0,
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) Minimal activity feed
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('post','event','system')),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4) Connections
CREATE TABLE IF NOT EXISTS public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  a_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  b_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending','connected','declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (a_id, b_id)
);

-- 5) Public profile view (plain)
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
  COALESCE(p.links, '[]'::jsonb) AS links,
  COALESCE(p.skills, '[]'::jsonb) AS skills,
  p.bio
FROM public.profiles p
WHERE COALESCE(p.visibility->>'profile', 'public') = 'public';

-- 6) RLS enable
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Profiles: self write
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_self_write'
  ) THEN
    CREATE POLICY "profiles_self_write"
    ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

    CREATE POLICY "profiles_self_update"
    ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END$$;

-- Onboarding: self only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='onboarding_progress' AND policyname='onboarding_self_rw'
  ) THEN
    CREATE POLICY "onboarding_self_rw"
    ON public.onboarding_progress
    FOR ALL TO authenticated
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);
  END IF;
END$$;

-- Feed: public read; self insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='activity_feed' AND policyname='feed_public_read'
  ) THEN
    CREATE POLICY "feed_public_read" ON public.activity_feed FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='activity_feed' AND policyname='feed_self_insert'
  ) THEN
    CREATE POLICY "feed_self_insert" ON public.activity_feed FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);
  END IF;
END$$;

-- Connections: both parties can see/write
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connections' AND policyname='connections_visible_to_parties'
  ) THEN
    CREATE POLICY "connections_visible_to_parties"
      ON public.connections FOR SELECT TO authenticated
      USING (auth.uid() = a_id OR auth.uid() = b_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='connections' AND policyname='connections_parties_write'
  ) THEN
    CREATE POLICY "connections_parties_write"
      ON public.connections FOR ALL TO authenticated
      USING (auth.uid() = a_id OR auth.uid() = b_id)
      WITH CHECK (auth.uid() = a_id OR auth.uid() = b_id);
  END IF;
END$$;

-- 7) Realtime publication additions (idempotent)
DO $$
BEGIN
  PERFORM 1 FROM pg_publication WHERE pubname='supabase_realtime';
  IF FOUND THEN
    PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='profiles';
    IF NOT FOUND THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;

    PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='activity_feed';
    IF NOT FOUND THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;
    END IF;

    PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='connections';
    IF NOT FOUND THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
    END IF;
  END IF;
END$$;

-- 8) Storage: avatars bucket + policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars','avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public read avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read avatars'
  ) THEN
    CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  END IF;
END$$;

-- Authenticated upload avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated upload avatars'
  ) THEN
    CREATE POLICY "Authenticated upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
  END IF;
END$$;