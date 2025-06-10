
-- Add new columns to profiles table for enhanced features
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_experience INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certifications TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS innovation_pathways TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS achievements TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS availability_for_mentoring BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS looking_for_opportunities BOOLEAN DEFAULT false;

-- Add comments for the new fields
COMMENT ON COLUMN public.profiles.website_url IS 'Personal or professional website URL';
COMMENT ON COLUMN public.profiles.phone IS 'Contact phone number';
COMMENT ON COLUMN public.profiles.years_experience IS 'Years of professional experience';
COMMENT ON COLUMN public.profiles.education IS 'Educational background and qualifications';
COMMENT ON COLUMN public.profiles.certifications IS 'Professional certifications and credentials';
COMMENT ON COLUMN public.profiles.innovation_pathways IS 'Innovation projects and pathways for African development';
COMMENT ON COLUMN public.profiles.achievements IS 'Key professional and personal achievements';
COMMENT ON COLUMN public.profiles.availability_for_mentoring IS 'Whether the user is available to mentor others';
COMMENT ON COLUMN public.profiles.looking_for_opportunities IS 'Whether the user is actively looking for opportunities';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_availability_for_mentoring ON public.profiles(availability_for_mentoring) WHERE availability_for_mentoring = true;
CREATE INDEX IF NOT EXISTS idx_profiles_looking_for_opportunities ON public.profiles(looking_for_opportunities) WHERE looking_for_opportunities = true;
CREATE INDEX IF NOT EXISTS idx_profiles_country_of_origin ON public.profiles(country_of_origin);
CREATE INDEX IF NOT EXISTS idx_profiles_current_country ON public.profiles(current_country);
CREATE INDEX IF NOT EXISTS idx_profiles_profession ON public.profiles(profession);
