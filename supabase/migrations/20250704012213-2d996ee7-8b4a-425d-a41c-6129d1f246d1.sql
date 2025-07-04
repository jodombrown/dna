-- Add missing account_visibility column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_visibility TEXT DEFAULT 'public' CHECK (account_visibility IN ('public', 'private', 'connections_only'));

-- Add any other missing columns that might be referenced
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_experience INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country_of_origin TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS diaspora_origin TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS available_for TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS impact_areas TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;