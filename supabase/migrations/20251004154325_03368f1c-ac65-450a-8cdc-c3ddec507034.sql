-- Add missing profile fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS diaspora_story TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country_of_origin_id UUID REFERENCES countries(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_country_id UUID REFERENCES countries(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_in_diaspora INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profession TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS industry_sectors TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability_hours_per_month INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contribution_types TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_preference TEXT DEFAULT 'remote';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_method TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_visible BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability_visible BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add username constraint
ALTER TABLE profiles ADD CONSTRAINT valid_username 
  CHECK (username ~ '^[a-z0-9_-]+$' AND length(username) >= 3);

-- Add completeness constraint
ALTER TABLE profiles ADD CONSTRAINT valid_completeness 
  CHECK (profile_completeness_score >= 0 AND profile_completeness_score <= 100);

-- Add availability constraint
ALTER TABLE profiles ADD CONSTRAINT valid_availability 
  CHECK (availability_hours_per_month >= 0 AND availability_hours_per_month <= 168);

-- Create profile_skills junction table if not exists
CREATE TABLE IF NOT EXISTS profile_skills (
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (profile_id, skill_id)
);

-- Create profile_causes junction table if not exists
CREATE TABLE IF NOT EXISTS profile_causes (
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cause_id UUID REFERENCES causes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (profile_id, cause_id)
);

-- Enable RLS on junction tables
ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_causes ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for junction tables
CREATE POLICY "Anyone can view profile skills"
  ON profile_skills FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own profile skills"
  ON profile_skills FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Anyone can view profile causes"
  ON profile_causes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own profile causes"
  ON profile_causes FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Create username generation function
CREATE OR REPLACE FUNCTION generate_username(_full_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 1;
BEGIN
  base_username := lower(regexp_replace(_full_name, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_username := regexp_replace(base_username, '\s+', '-', 'g');
  base_username := trim(both '-' from base_username);
  
  IF length(base_username) < 3 THEN
    base_username := base_username || '-user';
  END IF;
  
  final_username := base_username;
  
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    final_username := base_username || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_username;
END;
$$;

-- Update existing profiles to have usernames if they don't
UPDATE profiles 
SET username = generate_username(COALESCE(full_name, 'user'))
WHERE username IS NULL;

-- Make username NOT NULL after backfill
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;