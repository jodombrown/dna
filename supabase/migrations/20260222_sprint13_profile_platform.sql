-- ============================================================
-- Sprint 13: Profile Excellence + Platform Health
-- Run in Supabase SQL Editor in order
-- ============================================================

-- 1. Impact score cache on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS impact_scores JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS impact_scores_updated_at TIMESTAMPTZ;

-- 2. DIA uniqueness insight
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dia_insight TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dia_insight_updated_at TIMESTAMPTZ;

-- 3. Badge system
CREATE TABLE IF NOT EXISTS badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  c_module TEXT,
  category TEXT NOT NULL CHECK (category IN ('connect', 'convene', 'collaborate', 'contribute', 'convey', 'cross_c', 'milestone')),
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'org')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT false,
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_badges (use DO block to avoid errors on re-run)
DO $$ BEGIN
  CREATE POLICY "Anyone can see badges" ON user_badges FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "System manages badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users feature own badges" ON user_badges FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- Seed badge definitions
INSERT INTO badge_definitions (slug, name, description, icon, category, sort_order) VALUES
-- CONNECT
('first-10', 'First 10', 'Made your first 10 connections', '🤝', 'connect', 1),
('growing-network', 'Growing Network', 'Reached 50 connections', '🌐', 'connect', 2),
('global-connector', 'Global Connector', 'Connected across 10+ countries', '🌍', 'connect', 3),
-- CONVENE
('event-host', 'Event Host', 'Hosted your first event', '🎤', 'convene', 1),
('serial-host', 'Serial Host', 'Hosted 5+ events', '🎯', 'convene', 2),
('community-gatherer', 'Community Gatherer', 'Attended 20+ events', '🎪', 'convene', 3),
-- COLLABORATE
('space-creator', 'Space Creator', 'Created your first space', '🏗️', 'collaborate', 1),
('team-player', 'Team Player', 'Active in 5+ spaces', '👥', 'collaborate', 2),
-- CONTRIBUTE
('first-offer', 'First Offer', 'Posted your first opportunity', '💼', 'contribute', 1),
('skill-sharer', 'Skill Sharer', 'Fulfilled 5+ opportunities', '🎁', 'contribute', 2),
-- CONVEY
('storyteller', 'Storyteller', 'Published your first story', '📝', 'convey', 1),
('thought-leader', 'Thought Leader', 'Received 100+ total engagements', '💡', 'convey', 2),
('trending-voice', 'Trending Voice', 'Had a post trend in the community', '🔥', 'convey', 3),
-- CROSS-C
('five-cs-explorer', 'Five C''s Explorer', 'Active in all Five C''s', '⭐', 'cross_c', 1),
-- MILESTONE
('alpha-pioneer', 'Alpha Pioneer', 'Joined during alpha testing', '🚀', 'milestone', 1),
('profile-pro', 'Profile Pro', 'Completed 100% of profile', '✅', 'milestone', 2)
ON CONFLICT (slug) DO NOTHING;

-- 4. Opportunity status lifecycle
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';

-- 5. Opportunity interests table
CREATE TABLE IF NOT EXISTS opportunity_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(opportunity_id, user_id)
);

ALTER TABLE opportunity_interests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Poster sees all interests" ON opportunity_interests
    FOR SELECT USING (
      auth.uid() = user_id OR
      opportunity_id IN (SELECT id FROM opportunities WHERE created_by = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage own interest" ON opportunity_interests
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Poster or user updates" ON opportunity_interests
    FOR UPDATE USING (
      auth.uid() = user_id OR
      opportunity_id IN (SELECT id FROM opportunities WHERE created_by = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_opp_interests_opp ON opportunity_interests(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opp_interests_user ON opportunity_interests(user_id);
