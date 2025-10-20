-- Add username history tracking
CREATE TABLE IF NOT EXISTS username_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  old_username text NOT NULL,
  new_username text NOT NULL,
  changed_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_username_history_user ON username_history(user_id);

-- Ensure username is unique and add change counter
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS username_changes_count integer DEFAULT 0 CHECK (username_changes_count <= 3);

-- Add discovery tag columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS focus_areas text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS regional_expertise text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS industries text[] DEFAULT '{}';

-- Ensure existing array fields are not null
UPDATE profiles SET skills = '{}' WHERE skills IS NULL;
UPDATE profiles SET interests = '{}' WHERE interests IS NULL;
UPDATE profiles SET focus_areas = '{}' WHERE focus_areas IS NULL;
UPDATE profiles SET regional_expertise = '{}' WHERE regional_expertise IS NULL;
UPDATE profiles SET industries = '{}' WHERE industries IS NULL;

-- Drop and recreate username change function with new return type
DROP FUNCTION IF EXISTS update_username(text);

CREATE OR REPLACE FUNCTION update_username(new_username text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_old_username text;
  v_changes_count integer;
  v_available boolean;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get current username and change count
  SELECT username, COALESCE(username_changes_count, 0)
  INTO v_old_username, v_changes_count
  FROM profiles 
  WHERE id = v_user_id;
  
  -- Check if user has changes remaining
  IF v_changes_count >= 3 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Maximum username changes (3) reached'
    );
  END IF;
  
  -- Check if new username is available using existing function
  v_available := check_username_available(new_username, v_user_id);
  IF NOT v_available THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Username already taken'
    );
  END IF;
  
  -- Update username
  UPDATE profiles 
  SET 
    username = LOWER(new_username),
    username_changes_count = COALESCE(username_changes_count, 0) + 1,
    updated_at = now()
  WHERE id = v_user_id;
  
  -- Record change in history
  INSERT INTO username_history (user_id, old_username, new_username)
  VALUES (v_user_id, v_old_username, LOWER(new_username));
  
  RETURN jsonb_build_object(
    'success', true,
    'old_username', v_old_username,
    'new_username', LOWER(new_username),
    'changes_remaining', 2 - v_changes_count
  );
END;
$$;

-- Updated profile completion calculation with discovery tags
CREATE OR REPLACE FUNCTION calculate_profile_completion_percentage(profile_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  score integer := 0;
  profile_record profiles;
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = profile_id;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Basic Info (30 points)
  IF profile_record.avatar_url IS NOT NULL THEN score := score + 10; END IF;
  IF profile_record.full_name IS NOT NULL AND LENGTH(profile_record.full_name) > 0 THEN score := score + 5; END IF;
  IF profile_record.username IS NOT NULL AND LENGTH(profile_record.username) > 0 THEN score := score + 5; END IF;
  IF profile_record.headline IS NOT NULL AND LENGTH(profile_record.headline) > 0 THEN score := score + 5; END IF;
  IF profile_record.bio IS NOT NULL AND LENGTH(profile_record.bio) > 50 THEN score := score + 5; END IF;
  
  -- Professional Info (20 points)
  IF profile_record.profession IS NOT NULL AND LENGTH(profile_record.profession) > 0 THEN score := score + 5; END IF;
  IF profile_record.company IS NOT NULL AND LENGTH(profile_record.company) > 0 THEN score := score + 5; END IF;
  IF array_length(profile_record.skills, 1) >= 3 THEN score := score + 10; END IF;
  
  -- Discovery Tags (30 points) - CRITICAL FOR FINDABILITY
  IF array_length(profile_record.focus_areas, 1) >= 2 THEN score := score + 10; END IF;
  IF array_length(profile_record.regional_expertise, 1) >= 1 THEN score := score + 10; END IF;
  IF array_length(profile_record.industries, 1) >= 2 THEN score := score + 10; END IF;
  
  -- Heritage & Identity (10 points)
  IF profile_record.country_of_origin IS NOT NULL AND LENGTH(profile_record.country_of_origin) > 0 THEN score := score + 5; END IF;
  IF array_length(profile_record.languages_spoken, 1) >= 1 THEN score := score + 5; END IF;
  
  -- Engagement Flags (10 points)
  IF profile_record.availability_for_mentoring = true THEN score := score + 5; END IF;
  IF profile_record.looking_for_opportunities = true THEN score := score + 5; END IF;
  
  RETURN score;
END;
$$;

-- Enable RLS on username_history
ALTER TABLE username_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own username history
CREATE POLICY "Users can view own username history"
  ON username_history
  FOR SELECT
  USING (auth.uid() = user_id);