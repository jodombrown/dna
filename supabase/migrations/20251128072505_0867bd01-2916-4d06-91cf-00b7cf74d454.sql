-- DNA Profile v2 Backend Foundation
-- Adds verification, tags, completion scoring, activity management

-- 1. Create verification enum
DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending_verification', 'soft_verified', 'fully_verified');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add Profile v2 columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'pending_verification',
  ADD COLUMN IF NOT EXISTS verification_updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pinned_activity_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hidden_activity_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS profile_visibility_settings JSONB DEFAULT '{
    "about": "public",
    "skills": "public",
    "interests": "public",
    "activity": "public"
  }'::jsonb;

-- 3. Add ADIN tag arrays
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS diaspora_tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS region_tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS language_tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS skill_tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sector_tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS contribution_tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS availability_tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS event_interest_tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS intent_tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS collaboration_tags JSONB DEFAULT '[]'::jsonb;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON profiles (LOWER(username));
CREATE INDEX IF NOT EXISTS idx_profiles_verification ON profiles (verification_status);

-- 5. Completion score function (using existing fields only)
CREATE OR REPLACE FUNCTION compute_profile_completion_score(profile_record profiles)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Identity & Hero (25 points)
  IF profile_record.full_name IS NOT NULL AND profile_record.full_name != '' THEN score := score + 5; END IF;
  IF profile_record.avatar_url IS NOT NULL THEN score := score + 5; END IF;
  IF profile_record.headline IS NOT NULL AND profile_record.headline != '' THEN score := score + 5; END IF;
  IF profile_record.professional_role IS NOT NULL AND profile_record.professional_role != '' THEN score := score + 5; END IF;
  IF profile_record.current_country IS NOT NULL AND profile_record.current_country != '' THEN score := score + 5; END IF;
  
  -- Diaspora Story (20 points)
  IF profile_record.bio IS NOT NULL AND LENGTH(profile_record.bio) > 50 THEN score := score + 15; END IF;
  IF profile_record.country_of_origin IS NOT NULL AND profile_record.country_of_origin != '' THEN score := score + 5; END IF;
  
  -- Skills & Contributions (20 points)
  IF COALESCE(array_length(profile_record.skills, 1), 0) >= 3 THEN score := score + 15; END IF;
  IF COALESCE(array_length(profile_record.available_for, 1), 0) >= 1 THEN score := score + 5; END IF;
  
  -- Interests & Focus (15 points)
  IF COALESCE(array_length(profile_record.interests, 1), 0) >= 3 THEN score := score + 10; END IF;
  IF COALESCE(array_length(profile_record.impact_areas, 1), 0) >= 1 THEN score := score + 5; END IF;
  
  -- Experience (20 points)
  IF profile_record.profession IS NOT NULL AND profile_record.profession != '' THEN score := score + 7; END IF;
  IF profile_record.company IS NOT NULL AND profile_record.company != '' THEN score := score + 7; END IF;
  IF profile_record.years_experience IS NOT NULL AND profile_record.years_experience > 0 THEN score := score + 6; END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Trigger
CREATE OR REPLACE FUNCTION update_profile_completion_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_score := compute_profile_completion_score(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profile_completion ON profiles;
CREATE TRIGGER trigger_update_profile_completion
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion_score();

-- 7. Backfill scores
UPDATE profiles SET profile_completion_score = compute_profile_completion_score(profiles.*);