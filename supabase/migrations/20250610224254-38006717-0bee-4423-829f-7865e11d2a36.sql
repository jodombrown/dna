
-- Add diaspora-specific fields to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_in_diaspora INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS community_involvement TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS giving_back_initiatives TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_sectors TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS home_country_projects TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS diaspora_networks TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mentorship_areas TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS volunteer_experience TEXT;

-- Add comments to clarify the new fields
COMMENT ON COLUMN public.profiles.years_in_diaspora IS 'Number of years the person has been living outside their country of origin';
COMMENT ON COLUMN public.profiles.community_involvement IS 'Description of involvement in diaspora or local communities';
COMMENT ON COLUMN public.profiles.giving_back_initiatives IS 'Projects or initiatives focused on giving back to home country or diaspora community';
COMMENT ON COLUMN public.profiles.professional_sectors IS 'Array of professional sectors important to the diaspora community (e.g., healthcare, education, technology, finance)';
COMMENT ON COLUMN public.profiles.home_country_projects IS 'Specific projects or contributions to home country development';
COMMENT ON COLUMN public.profiles.diaspora_networks IS 'Diaspora networks or organizations the person is part of';
COMMENT ON COLUMN public.profiles.mentorship_areas IS 'Specific areas where the person can provide mentorship';
COMMENT ON COLUMN public.profiles.volunteer_experience IS 'Volunteer work within diaspora or home country communities';
