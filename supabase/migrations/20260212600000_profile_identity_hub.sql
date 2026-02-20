-- ============================================================
-- DNA | Profile & Identity Hub — Database Migration
--
-- Tables: profile_skills, profile_interests, profile_badges,
--         profile_views_hub, onboarding_state, dia_rematch_queue
--
-- Functions: endorse_skill, record_profile_view_hub,
--            trigger_dia_rematch
--
-- This migration adds the Cross-C Identity Hub schema,
-- enriching the existing profiles table with new JSONB columns
-- for heritage, activity summary, impact score, completion
-- checklist, and enhanced visibility settings.
-- ============================================================

-- ============================================================
-- ENHANCE PROFILES TABLE
-- Add new columns for the Identity Hub layers
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS heritage JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS activity_summary JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS impact_score JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS dia_insight TEXT,
  ADD COLUMN IF NOT EXISTS completion_checklist JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS hub_visibility JSONB NOT NULL DEFAULT '{
    "profileDiscoverable": true,
    "showActivity": "connections",
    "showConnections": "connections",
    "showHeritage": "everyone",
    "showExperience": "everyone",
    "showContributions": "connections",
    "showImpactScore": "connections",
    "showBadges": true,
    "showOnlineStatus": true
  }',
  ADD COLUMN IF NOT EXISTS cultural_pattern TEXT DEFAULT 'kente',
  ADD COLUMN IF NOT EXISTS first_post_at TIMESTAMPTZ;

-- Indexes on new JSONB columns
CREATE INDEX IF NOT EXISTS idx_profiles_heritage ON profiles USING gin(heritage);
CREATE INDEX IF NOT EXISTS idx_profiles_activity_summary ON profiles USING gin(activity_summary);
CREATE INDEX IF NOT EXISTS idx_profiles_impact_score ON profiles USING gin(impact_score);

-- Full-text search on profile identity fields
CREATE INDEX IF NOT EXISTS idx_profiles_identity_search ON profiles USING gin(
  to_tsvector('english',
    COALESCE(full_name, '') || ' ' ||
    COALESCE(headline, '') || ' ' ||
    COALESCE(bio, '') || ' ' ||
    COALESCE(industry, '')
  )
);

-- ============================================================
-- PROFILE SKILLS
-- Structured skill records with endorsements and DIA strength
-- ============================================================

CREATE TABLE IF NOT EXISTS profile_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'technical',
  endorsement_count INTEGER DEFAULT 0,
  endorsed_by UUID[] DEFAULT '{}',
  is_top_skill BOOLEAN DEFAULT FALSE,
  dia_strength FLOAT DEFAULT 0,
  source TEXT DEFAULT 'user_added',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_profile_skills_user ON profile_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_skills_name ON profile_skills(name);
CREATE INDEX IF NOT EXISTS idx_profile_skills_category ON profile_skills(category);

ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profile_skills' AND policyname = 'Skills viewable by all'
  ) THEN
    CREATE POLICY "Skills viewable by all" ON profile_skills FOR SELECT USING (TRUE);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profile_skills' AND policyname = 'Users manage own skills'
  ) THEN
    CREATE POLICY "Users manage own skills" ON profile_skills
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- PROFILE INTERESTS
-- Categorized interest tags
-- ============================================================

CREATE TABLE IF NOT EXISTS profile_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'professional',
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_profile_interests_user ON profile_interests(user_id);

ALTER TABLE profile_interests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profile_interests' AND policyname = 'Interests viewable by all'
  ) THEN
    CREATE POLICY "Interests viewable by all" ON profile_interests FOR SELECT USING (TRUE);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profile_interests' AND policyname = 'Users manage own interests'
  ) THEN
    CREATE POLICY "Users manage own interests" ON profile_interests
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- PROFILE BADGES
-- Achievement badges tied to Five C's activity milestones
-- ============================================================

CREATE TABLE IF NOT EXISTS profile_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  c_module TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_displayed BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_profile_badges_user ON profile_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_badges_type ON profile_badges(type);

ALTER TABLE profile_badges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profile_badges' AND policyname = 'Badges viewable by all'
  ) THEN
    CREATE POLICY "Badges viewable by all" ON profile_badges FOR SELECT USING (TRUE);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profile_badges' AND policyname = 'Users manage own badge display'
  ) THEN
    CREATE POLICY "Users manage own badge display" ON profile_badges
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- PROFILE VIEWS (Hub version with view context)
-- ============================================================

CREATE TABLE IF NOT EXISTS profile_views_hub (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  view_context TEXT NOT NULL DEFAULT 'not_connected',
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_hub_profile ON profile_views_hub(profile_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_hub_viewer ON profile_views_hub(viewer_id, viewed_at DESC);

ALTER TABLE profile_views_hub ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profile_views_hub' AND policyname = 'Users see own profile views'
  ) THEN
    CREATE POLICY "Users see own profile views" ON profile_views_hub
      FOR SELECT USING (auth.uid() = profile_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profile_views_hub' AND policyname = 'Authenticated users can insert views'
  ) THEN
    CREATE POLICY "Authenticated users can insert views" ON profile_views_hub
      FOR INSERT WITH CHECK (auth.uid() = viewer_id);
  END IF;
END $$;

-- ============================================================
-- ONBOARDING STATE
-- Tracks user progress through the 7-step onboarding wizard
-- ============================================================

CREATE TABLE IF NOT EXISTS onboarding_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL DEFAULT 'welcome',
  completed_steps TEXT[] DEFAULT '{}',
  skipped_steps TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE onboarding_state ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'onboarding_state' AND policyname = 'Users manage own onboarding'
  ) THEN
    CREATE POLICY "Users manage own onboarding" ON onboarding_state
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- DIA REMATCH QUEUE
-- Queue for DIA to reprocess matching when profiles change
-- ============================================================

CREATE TABLE IF NOT EXISTS dia_rematch_queue (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE dia_rematch_queue ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'dia_rematch_queue' AND policyname = 'System manages rematch queue'
  ) THEN
    CREATE POLICY "System manages rematch queue" ON dia_rematch_queue
      FOR ALL USING (TRUE);
  END IF;
END $$;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Skill endorsement with duplicate prevention
CREATE OR REPLACE FUNCTION endorse_skill(p_skill_id UUID, p_endorser_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profile_skills
  SET
    endorsement_count = endorsement_count + 1,
    endorsed_by = array_append(endorsed_by, p_endorser_id)
  WHERE id = p_skill_id
    AND NOT (p_endorser_id = ANY(endorsed_by));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profile view recording with 1-hour rate limiting per viewer
CREATE OR REPLACE FUNCTION record_profile_view_hub(
  p_profile_id UUID,
  p_viewer_id UUID,
  p_context TEXT
)
RETURNS VOID AS $$
DECLARE
  v_last_view TIMESTAMPTZ;
BEGIN
  -- Rate limit: max 1 view per viewer per profile per hour
  SELECT viewed_at INTO v_last_view
  FROM profile_views_hub
  WHERE profile_id = p_profile_id AND viewer_id = p_viewer_id
  ORDER BY viewed_at DESC LIMIT 1;

  IF v_last_view IS NULL OR v_last_view < NOW() - INTERVAL '1 hour' THEN
    INSERT INTO profile_views_hub (profile_id, viewer_id, view_context)
    VALUES (p_profile_id, p_viewer_id, p_context);

    UPDATE profiles
    SET profile_views_count = COALESCE(profile_views_count, 0) + 1
    WHERE id = p_profile_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DIA rematch trigger (upsert into queue)
CREATE OR REPLACE FUNCTION trigger_dia_rematch(p_user_id UUID, p_reason TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO dia_rematch_queue (user_id, reason, queued_at)
  VALUES (p_user_id, p_reason, NOW())
  ON CONFLICT (user_id) DO UPDATE SET reason = p_reason, queued_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Count unique countries across a user's connections
CREATE OR REPLACE FUNCTION count_connection_countries(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT p.current_country) INTO v_count
  FROM connections c
  JOIN profiles p ON (
    CASE
      WHEN c.user_id = p_user_id THEN p.id = c.connected_user_id
      ELSE p.id = c.user_id
    END
  )
  WHERE (c.user_id = p_user_id OR c.connected_user_id = p_user_id)
    AND c.status = 'accepted'
    AND p.current_country IS NOT NULL;

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
