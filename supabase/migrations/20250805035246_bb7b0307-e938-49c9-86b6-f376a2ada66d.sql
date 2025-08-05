-- Sprint 1: Critical onboarding field mapping and validation fixes (corrected)

-- 1. Add missing twitter_url field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- 2. Add missing agrees_to_values field for consent tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS agrees_to_values BOOLEAN DEFAULT false;

-- 3. Create index for username uniqueness check performance
CREATE INDEX IF NOT EXISTS idx_profiles_username_unique 
ON public.profiles (lower(username)) 
WHERE username IS NOT NULL;