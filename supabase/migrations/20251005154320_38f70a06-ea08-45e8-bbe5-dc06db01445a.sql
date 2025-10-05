-- RLS Policies for Profiles Table
-- These policies allow public profiles to be viewed by everyone,
-- while only allowing users to edit their own profiles

-- Allow everyone to view public profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (
  COALESCE(is_public, true) = true
  AND onboarding_completed_at IS NOT NULL
);

-- Allow users to view their own profile (even if private)
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (for new signups)
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);