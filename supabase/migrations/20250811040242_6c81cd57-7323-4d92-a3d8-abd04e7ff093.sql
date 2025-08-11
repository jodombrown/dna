-- DNA Onboarding Sprint: profiles fields, username normalization, onboarding_progress, avatars bucket, realtime

-- 1) Profiles columns for onboarding
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS middle_initial text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS onboarding_progress jsonb NOT NULL DEFAULT '{"percent":0}'::jsonb;

-- Ensure middle_initial is max 1 char (simple constraint)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_middle_initial_len'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_middle_initial_len CHECK (middle_initial IS NULL OR char_length(middle_initial) <= 1);
  END IF;
END $$;

-- 2) Username case-insensitive uniqueness and normalization
-- Unique index on lower(username) excluding null
CREATE UNIQUE INDEX IF NOT EXISTS uniq_profiles_username_ci
  ON public.profiles ((lower(username)))
  WHERE username IS NOT NULL;

-- Trigger to lowercase username on insert/update
CREATE OR REPLACE FUNCTION public.normalize_username()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN
    NEW.username := lower(trim(NEW.username));
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_normalize_username'
  ) THEN
    CREATE TRIGGER trg_profiles_normalize_username
    BEFORE INSERT OR UPDATE OF username ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.normalize_username();
  END IF;
END $$;

-- Backfill display_name if missing
UPDATE public.profiles p
SET display_name = COALESCE(
  NULLIF(trim(p.first_name || ' ' || COALESCE(NULLIF(trim(p.middle_initial), '' ) || '.', '') || CASE WHEN p.middle_initial IS NULL OR trim(p.middle_initial) = '' THEN '' ELSE ' ' END || p.last_name), ''),
  NULLIF(p.full_name, ''),
  p.username
)
WHERE COALESCE(display_name,'') = '';

-- 3) Storage: create avatars bucket and policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policy for avatars
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Avatar images are publicly accessible'
  ) THEN
    CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');
  END IF;
END $$;

-- Authenticated users can manage their own avatar folder user-avatars/{uid}/...
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload their own avatar'
  ) THEN
    CREATE POLICY "Users can upload their own avatar"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'avatars' AND
      auth.uid()::text = (storage.foldername(name))[2] -- name like user-avatars/<uid>/...
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update their own avatar'
  ) THEN
    CREATE POLICY "Users can update their own avatar"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'avatars' AND
      auth.uid()::text = (storage.foldername(name))[2]
    );
  END IF;
END $$;

-- 4) Realtime: ensure profiles table in publication and REPLICA IDENTITY FULL
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles';
  END IF;
END $$;