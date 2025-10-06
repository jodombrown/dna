-- Add onboarding completion timestamp to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Create index for faster queries (without updating existing rows yet)
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding 
ON profiles(onboarding_completed_at) 
WHERE onboarding_completed_at IS NOT NULL;

-- Note: We will NOT auto-mark existing users as completed to avoid constraint violations
-- Instead, the onboarding flow will set this timestamp when users complete onboarding
-- For testing purposes, you can manually set this for specific users via Supabase dashboard