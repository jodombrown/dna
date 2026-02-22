
-- Impact score columns on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS impact_scores JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS impact_scores_updated_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dia_insight TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dia_insight_updated_at TIMESTAMPTZ;

-- Badge definitions
CREATE TABLE IF NOT EXISTS badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  criteria JSONB DEFAULT '{}',
  tier TEXT DEFAULT 'bronze',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badges" ON badge_definitions FOR SELECT USING (true);

-- User badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view user badges" ON user_badges FOR SELECT USING (true);
CREATE POLICY "System inserts badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- Opportunity interests
CREATE TABLE IF NOT EXISTS opportunity_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(opportunity_id, user_id)
);
ALTER TABLE opportunity_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view interests" ON opportunity_interests FOR SELECT USING (true);
CREATE POLICY "Users manage own interests" ON opportunity_interests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own interests" ON opportunity_interests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Opportunity owners can update" ON opportunity_interests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM opportunities WHERE id = opportunity_id AND created_by = auth.uid())
);
CREATE INDEX idx_opp_interests_opp ON opportunity_interests(opportunity_id);
CREATE INDEX idx_opp_interests_user ON opportunity_interests(user_id);

-- Seed badge definitions (16 badges)
INSERT INTO badge_definitions (slug, name, description, icon, category) VALUES
  ('alpha-pioneer', 'Alpha Pioneer', 'Among the first DNA members', 'Star', 'milestone'),
  ('first-connection', 'First Connection', 'Made your first connection', 'UserPlus', 'connect'),
  ('first-10', 'Network Builder', 'Connected with 10+ members', 'Users', 'connect'),
  ('global-connector', 'Global Connector', 'Network spans 5+ countries', 'Globe', 'connect'),
  ('event-host', 'Event Host', 'Hosted your first event', 'Calendar', 'convene'),
  ('event-regular', 'Event Regular', 'Attended 5+ events', 'CalendarCheck', 'convene'),
  ('space-creator', 'Space Creator', 'Created a collaboration space', 'Rocket', 'collaborate'),
  ('team-player', 'Team Player', 'Joined 3+ spaces', 'Users2', 'collaborate'),
  ('opportunity-poster', 'Opportunity Poster', 'Posted your first opportunity', 'Briefcase', 'contribute'),
  ('contributor', 'Contributor', 'Expressed interest in 3+ opportunities', 'HandHeart', 'contribute'),
  ('fulfiller', 'Fulfiller', 'Fulfilled an opportunity', 'CheckCircle', 'contribute'),
  ('storyteller', 'Storyteller', 'Published your first post', 'PenLine', 'convey'),
  ('prolific-writer', 'Prolific Writer', 'Published 10+ posts', 'BookOpen', 'convey'),
  ('influencer', 'Influencer', 'Gained 10+ followers', 'TrendingUp', 'convey'),
  ('five-c-explorer', 'Five C Explorer', 'Active in all Five Cs', 'Pentagon', 'milestone'),
  ('heritage-bridge', 'Heritage Bridge', 'Connected diaspora across 3+ heritage groups', 'Bridge', 'milestone')
ON CONFLICT (slug) DO NOTHING;
