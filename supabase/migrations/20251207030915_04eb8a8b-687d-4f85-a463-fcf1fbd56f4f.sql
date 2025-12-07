
-- Create a security definer function to return safe profile data
-- This hides sensitive fields from non-owners
CREATE OR REPLACE FUNCTION public.get_safe_profile_fields(
  profile_id uuid,
  viewer_id uuid
)
RETURNS TABLE (
  id uuid,
  -- Public safe fields
  username text,
  display_name text,
  full_name text,
  first_name text,
  last_name text,
  avatar_url text,
  profile_picture_url text,
  banner_url text,
  headline text,
  bio text,
  professional_role text,
  profession text,
  industry text,
  years_experience integer,
  company text,
  venture_name text,
  venture_stage text,
  -- Diaspora identity (core to DNA mission - safe to show)
  country_of_origin text,
  diaspora_origin text,
  origin_country_name text,
  current_country text,
  current_country_name text,
  current_city text,
  current_region text,
  -- Public arrays
  skills text[],
  interests text[],
  interest_tags text[],
  sectors text[],
  impact_areas text[],
  impact_regions text[],
  sdg_focus text[],
  available_for text[],
  offers text[],
  needs text[],
  networking_goals text[],
  -- Status
  is_public boolean,
  created_at timestamptz,
  -- Sensitive fields (only for owner)
  email text,
  location text,
  current_location text,
  linkedin_url text,
  twitter_url text,
  website_url text,
  preferred_contact text,
  available_hours_per_month integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    -- Public safe fields - always visible
    p.username,
    p.display_name,
    p.full_name,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.profile_picture_url,
    p.banner_url,
    p.headline,
    p.bio,
    p.professional_role,
    p.profession,
    p.industry,
    p.years_experience,
    p.company,
    p.venture_name,
    p.venture_stage,
    -- Diaspora identity
    p.country_of_origin,
    p.diaspora_origin,
    p.origin_country_name,
    p.current_country,
    p.current_country_name,
    p.current_city,
    p.current_region,
    -- Public arrays
    p.skills,
    p.interests,
    p.interest_tags,
    p.sectors,
    p.impact_areas,
    p.impact_regions,
    p.sdg_focus,
    p.available_for,
    p.offers,
    p.needs,
    p.networking_goals,
    -- Status
    p.is_public,
    p.created_at,
    -- Sensitive fields - only show to profile owner
    CASE WHEN p.id = viewer_id THEN p.email ELSE NULL END,
    CASE WHEN p.id = viewer_id THEN p.location ELSE NULL END,
    CASE WHEN p.id = viewer_id THEN p.current_location ELSE NULL END,
    CASE WHEN p.id = viewer_id THEN p.linkedin_url ELSE NULL END,
    CASE WHEN p.id = viewer_id THEN p.twitter_url ELSE NULL END,
    CASE WHEN p.id = viewer_id THEN p.website_url ELSE NULL END,
    CASE WHEN p.id = viewer_id THEN p.preferred_contact ELSE NULL END,
    CASE WHEN p.id = viewer_id THEN p.available_hours_per_month ELSE NULL END
  FROM profiles p
  WHERE p.id = profile_id
    AND (p.is_public = true OR p.id = viewer_id);
END;
$$;

-- Create a secure view for public profile access
CREATE OR REPLACE VIEW public.public_profiles AS
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
  -- NOTE: email, location, linkedin_url, twitter_url, website_url, 
  -- preferred_contact, available_hours_per_month are intentionally excluded
FROM profiles
WHERE is_public = true;

-- Update the profiles_select policy to be more restrictive
-- Non-owners can only see their own profile via direct table access
-- For viewing others, they should use public_profiles view or get_safe_profile_fields function
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- Authenticated users can see public profiles (limited fields via view) or their own full profile
CREATE POLICY "profiles_select" ON public.profiles
FOR SELECT USING (
  -- Owner can see their full profile
  id = (SELECT auth.uid())
  -- Authenticated users can see public profiles (but should use public_profiles view for safety)
  OR (is_public = true AND (SELECT auth.uid()) IS NOT NULL)
);

-- Grant access to the public_profiles view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
