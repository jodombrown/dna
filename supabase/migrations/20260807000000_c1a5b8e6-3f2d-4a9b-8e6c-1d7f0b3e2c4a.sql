-- BD398 follow-on: engagement_geography — countries where a member wants
-- their engagement to land (ISO-3 alpha-3, no FK). Distinct from
-- member_heritage.origin_country (where they're from). Needed specifically
-- because Allies stand outside the kinship/heritage frame by design and
-- have no other field to express "I want to help in Kenya."
--
-- Public-by-default per D100: follows the same is_public / account_visibility
-- gate every other profile array field already uses. No separate privacy
-- control.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS engagement_geography text[];

-- 1. VIEW public_profiles — DROP + CREATE (PG can't add columns via CREATE OR REPLACE
--    when the column list changes ordering/composition safely otherwise, but we DROP
--    to stay consistent with how prior passes on this view have been done)
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
 SELECT id,
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
    ( SELECT mh.origin_country
           FROM member_heritage mh
          WHERE mh.profile_id = profiles.id AND mh.is_primary
         LIMIT 1) AS primary_origin_country,
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
    engagement_geography,
    sdg_focus,
    available_for,
    offers,
    needs,
    networking_goals,
    is_public,
    created_at,
    role,
    continent,
    country
   FROM profiles
  WHERE is_public = true;

-- Re-apply original grants (live relacl: postgres, anon, authenticated, service_role all full)
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.public_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.public_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.public_profiles TO service_role;

-- 2. FUNCTION get_safe_profile_fields — DROP + CREATE (return signature changes)
DROP FUNCTION IF EXISTS public.get_safe_profile_fields(uuid, uuid);

CREATE OR REPLACE FUNCTION public.get_safe_profile_fields(profile_id uuid, viewer_id uuid)
 RETURNS TABLE(id uuid, username text, display_name text, full_name text, first_name text, last_name text, avatar_url text, profile_picture_url text, banner_url text, headline text, bio text, professional_role text, profession text, industry text, years_experience integer, company text, venture_name text, venture_stage text, primary_origin_country text, current_country text, current_country_name text, current_city text, current_region text, skills text[], interests text[], interest_tags text[], sectors text[], impact_areas text[], impact_regions text[], engagement_geography text[], sdg_focus text[], available_for text[], offers text[], needs text[], networking_goals text[], is_public boolean, created_at timestamp with time zone, email text, location text, current_location text, linkedin_url text, twitter_url text, website_url text, preferred_contact text, available_hours_per_month integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    -- Diaspora identity (re-pointed to member_heritage)
    (select mh.origin_country from public.member_heritage mh
       where mh.profile_id = p.id and mh.is_primary limit 1) AS primary_origin_country,
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
    p.engagement_geography,
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
$function$;

REVOKE EXECUTE ON FUNCTION public.get_safe_profile_fields(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_safe_profile_fields(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_safe_profile_fields(uuid, uuid) TO service_role;
