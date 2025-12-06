-- Add all missing columns to profiles table for onboarding
-- These columns are referenced in the onboarding flow but don't exist in the schema

-- Array fields for professional/discovery data
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_sectors text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS focus_areas text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS regional_expertise text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS industries text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS engagement_intentions text[] DEFAULT '{}';

-- Additional fields from ProfileFormSubmission and FormDataTypes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills_offered text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills_needed text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS diaspora_networks text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mentorship_areas text[] DEFAULT '{}';

-- Text fields from FormDataTypes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certifications text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_in_diaspora integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS innovation_pathways text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS achievements text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS past_contributions text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS community_involvement text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS giving_back_initiatives text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS home_country_projects text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS volunteer_experience text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS availability_for_mentoring boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS looking_for_opportunities boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization text;