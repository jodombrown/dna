-- Add missing engagement_intentions column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS engagement_intentions text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.engagement_intentions IS 'User engagement intentions from onboarding (e.g., Find Collaborators, Seek Investment, Offer Mentorship)';