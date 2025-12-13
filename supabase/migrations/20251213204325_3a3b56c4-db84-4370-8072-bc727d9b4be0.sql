-- Add allow_profile_sharing column to profiles table
-- This controls whether other users can share this user's profile via share buttons
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS allow_profile_sharing boolean DEFAULT true;

-- Add a comment for documentation
COMMENT ON COLUMN public.profiles.allow_profile_sharing IS 'Whether other users can share this profile via share buttons. Default true.';