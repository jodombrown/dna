
-- Drop and recreate the view with security_invoker = true
-- This ensures RLS policies of the querying user are respected
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  display_name,
  full_name,
  first_name,
  last_name,
  avatar_url,
  profile_picture_url,
  banner_url,
  headline,
  bio,
  professional_role,
  profession,
  industry,
  years_experience,
  company,
  venture_name,
  venture_stage,
  country_of_origin,
  diaspora_origin,
  origin_country_name,
  current_country,
  current_country_name,
  current_city,
  current_region,
  skills,
  interests,
  interest_tags,
  sectors,
  impact_areas,
  impact_regions,
  sdg_focus,
  available_for,
  offers,
  needs,
  networking_goals,
  is_public,
  created_at
  -- Sensitive fields excluded: email, location, linkedin_url, twitter_url, 
  -- website_url, preferred_contact, available_hours_per_month
FROM profiles
WHERE is_public = true;

-- Re-grant access
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
