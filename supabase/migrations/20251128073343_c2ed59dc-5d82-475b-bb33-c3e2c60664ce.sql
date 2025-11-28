-- Profile v2 Update RPCs
-- These RPCs allow users to update their profile sections

-- Update Identity (name, headline, role, company)
CREATE OR REPLACE FUNCTION update_profile_identity(
  p_user_id UUID,
  p_full_name TEXT DEFAULT NULL,
  p_headline TEXT DEFAULT NULL,
  p_professional_role TEXT DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Update only provided fields
  UPDATE profiles
  SET
    full_name = COALESCE(p_full_name, full_name),
    headline = COALESCE(p_headline, headline),
    professional_role = COALESCE(p_professional_role, professional_role),
    company = COALESCE(p_company, company),
    location = COALESCE(p_location, location),
    updated_at = now()
  WHERE id = p_user_id;

  -- Recompute completion score
  PERFORM update_profile_completion_score(p_user_id);

  -- Return success
  SELECT json_build_object('success', true, 'message', 'Identity updated')
  INTO v_result;

  RETURN v_result;
END;
$$;

-- Update About/Bio
CREATE OR REPLACE FUNCTION update_profile_about(
  p_user_id UUID,
  p_bio TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  UPDATE profiles
  SET
    bio = p_bio,
    updated_at = now()
  WHERE id = p_user_id;

  PERFORM update_profile_completion_score(p_user_id);

  SELECT json_build_object('success', true, 'message', 'About section updated')
  INTO v_result;

  RETURN v_result;
END;
$$;

-- Update Diaspora Identity
CREATE OR REPLACE FUNCTION update_profile_diaspora(
  p_user_id UUID,
  p_country_of_origin TEXT DEFAULT NULL,
  p_current_country TEXT DEFAULT NULL,
  p_diaspora_origin TEXT DEFAULT NULL,
  p_diaspora_tags JSONB DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  UPDATE profiles
  SET
    country_of_origin = COALESCE(p_country_of_origin, country_of_origin),
    current_country = COALESCE(p_current_country, current_country),
    diaspora_origin = COALESCE(p_diaspora_origin, diaspora_origin),
    diaspora_tags = COALESCE(p_diaspora_tags, diaspora_tags),
    updated_at = now()
  WHERE id = p_user_id;

  PERFORM update_profile_completion_score(p_user_id);

  SELECT json_build_object('success', true, 'message', 'Diaspora identity updated')
  INTO v_result;

  RETURN v_result;
END;
$$;

-- Update Skills
CREATE OR REPLACE FUNCTION update_profile_skills(
  p_user_id UUID,
  p_skills JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  UPDATE profiles
  SET
    skills = p_skills,
    skill_tags = p_skills,
    updated_at = now()
  WHERE id = p_user_id;

  PERFORM update_profile_completion_score(p_user_id);

  SELECT json_build_object('success', true, 'message', 'Skills updated')
  INTO v_result;

  RETURN v_result;
END;
$$;

-- Update Contributions
CREATE OR REPLACE FUNCTION update_profile_contributions(
  p_user_id UUID,
  p_contribution_tags JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  UPDATE profiles
  SET
    contribution_tags = p_contribution_tags,
    updated_at = now()
  WHERE id = p_user_id;

  PERFORM update_profile_completion_score(p_user_id);

  SELECT json_build_object('success', true, 'message', 'Contributions updated')
  INTO v_result;

  RETURN v_result;
END;
$$;

-- Update Interests
CREATE OR REPLACE FUNCTION update_profile_interests(
  p_user_id UUID,
  p_interests JSONB,
  p_interest_tags JSONB DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  UPDATE profiles
  SET
    interests = p_interests,
    interest_tags = COALESCE(p_interest_tags, p_interests),
    updated_at = now()
  WHERE id = p_user_id;

  PERFORM update_profile_completion_score(p_user_id);

  SELECT json_build_object('success', true, 'message', 'Interests updated')
  INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_profile_identity TO authenticated;
GRANT EXECUTE ON FUNCTION update_profile_about TO authenticated;
GRANT EXECUTE ON FUNCTION update_profile_diaspora TO authenticated;
GRANT EXECUTE ON FUNCTION update_profile_skills TO authenticated;
GRANT EXECUTE ON FUNCTION update_profile_contributions TO authenticated;
GRANT EXECUTE ON FUNCTION update_profile_interests TO authenticated;