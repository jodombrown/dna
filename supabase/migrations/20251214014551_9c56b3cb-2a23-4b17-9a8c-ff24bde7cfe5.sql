-- Add new "My Connection to Africa" fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ethnic_heritage TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS return_intentions TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS african_causes TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS africa_visit_frequency TEXT DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.ethnic_heritage IS 'Ethnic/tribal heritage identities (e.g., Yoruba, Zulu, Berber)';
COMMENT ON COLUMN public.profiles.return_intentions IS 'Intentions to relocate/return to Africa';
COMMENT ON COLUMN public.profiles.african_causes IS 'African development causes they care about';
COMMENT ON COLUMN public.profiles.africa_visit_frequency IS 'How often they visit Africa';