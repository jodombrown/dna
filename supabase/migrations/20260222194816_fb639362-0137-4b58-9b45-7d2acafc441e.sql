
-- =============================================
-- Sprint 12 Missing Migrations
-- =============================================

-- 1. Tags on posts (events already has tags)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_events_tags ON events USING GIN (tags);

-- 2. Profile completion table
CREATE TABLE IF NOT EXISTS profile_completion (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  steps_completed TEXT[] DEFAULT '{}',
  guide_dismissed BOOLEAN DEFAULT false,
  guide_minimized BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profile_completion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own completion" ON profile_completion
  FOR ALL USING ((select auth.uid()) = user_id);

-- 3. User follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, followed_id),
  CHECK (follower_id != followed_id)
);
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can see follows" ON user_follows
  FOR SELECT USING (true);
CREATE POLICY "Users manage own follows" ON user_follows
  FOR INSERT WITH CHECK ((select auth.uid()) = follower_id);
CREATE POLICY "Users can unfollow" ON user_follows
  FOR DELETE USING ((select auth.uid()) = follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followed ON user_follows(followed_id);

-- 4. Follower/following counts on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- 5. Feedback deleted_at
ALTER TABLE feedback_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
