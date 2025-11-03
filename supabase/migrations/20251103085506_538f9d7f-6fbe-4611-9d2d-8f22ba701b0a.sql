-- Add indexes for remaining unindexed foreign keys

-- profile_skills
CREATE INDEX IF NOT EXISTS idx_profile_skills_skill_id ON public.profile_skills(skill_id);

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_country_of_origin_id ON public.profiles(country_of_origin_id);
CREATE INDEX IF NOT EXISTS idx_profiles_current_country_id ON public.profiles(current_country_id);