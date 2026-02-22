-- Sprint 12: Foundation + Onboarding + Engagement
-- Phase 12C: Schema Hardening - Tags columns on content tables
-- Phase 12D.2: Follower system (user_follows)
-- Phase 12B: Profile completion tracking
-- Phase 12A: Feedback Hub schema fixes

-- ============================================================
-- PHASE 12C: TAGS COLUMNS ON CONTENT TABLES
-- ============================================================

-- Add tags column to posts (for sector/topic tagging)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add tags to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add tags to opportunities
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add tags to spaces
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create GIN indexes for fast tag queries
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_events_tags ON events USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_opportunities_tags ON opportunities USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_spaces_tags ON spaces USING GIN (tags);

-- Backfill posts.tags from post_hashtags junction table (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'post_hashtags'
  ) THEN
    UPDATE posts p
    SET tags = sub.tag_array
    FROM (
      SELECT ph.post_id, ARRAY_AGG(h.name) AS tag_array
      FROM post_hashtags ph
      JOIN hashtags h ON ph.hashtag_id = h.id
      GROUP BY ph.post_id
    ) sub
    WHERE p.id = sub.post_id
    AND (p.tags IS NULL OR p.tags = '{}');
  END IF;
END $$;

-- Seed data tag backfill: tag posts by author's professional_sectors
UPDATE posts p
SET tags = prof.professional_sectors
FROM profiles prof
WHERE p.author_id = prof.id
AND prof.professional_sectors IS NOT NULL
AND ARRAY_LENGTH(prof.professional_sectors, 1) > 0
AND (p.tags IS NULL OR p.tags = '{}');

-- Tag events with general tags if empty
UPDATE events
SET tags = ARRAY['networking', 'diaspora', 'professional-development']
WHERE (tags IS NULL OR tags = '{}');

-- Tag opportunities with general tags if empty
UPDATE opportunities
SET tags = ARRAY['opportunity', 'diaspora', 'contribution']
WHERE (tags IS NULL OR tags = '{}');

-- ============================================================
-- PHASE 12D.2: FOLLOWER SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, followed_id),
  CHECK (follower_id != followed_id)
);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_follows
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_follows' AND policyname = 'Anyone can see follows') THEN
    CREATE POLICY "Anyone can see follows" ON user_follows FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_follows' AND policyname = 'Users manage own follows') THEN
    CREATE POLICY "Users manage own follows" ON user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_follows' AND policyname = 'Users can unfollow') THEN
    CREATE POLICY "Users can unfollow" ON user_follows FOR DELETE USING (auth.uid() = follower_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followed ON user_follows(followed_id);

-- Denormalized counts on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- ============================================================
-- PHASE 12B: PROFILE COMPLETION TRACKING
-- ============================================================

CREATE TABLE IF NOT EXISTS profile_completion (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  steps_completed TEXT[] DEFAULT '{}',
  guide_dismissed BOOLEAN DEFAULT false,
  guide_minimized BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profile_completion ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profile_completion' AND policyname = 'Users manage own completion') THEN
    CREATE POLICY "Users manage own completion" ON profile_completion FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- PHASE 12A: FEEDBACK HUB SCHEMA FIXES
-- ============================================================

-- Add is_default column to feedback_channels if missing
ALTER TABLE feedback_channels ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Ensure at least one default channel exists
INSERT INTO feedback_channels (name, description, is_default)
SELECT 'General', 'General platform feedback', true
WHERE NOT EXISTS (
  SELECT 1 FROM feedback_channels WHERE is_default = true
);

-- Add soft delete support if missing
ALTER TABLE feedback_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add page_url column for auto-captured context
ALTER TABLE feedback_messages ADD COLUMN IF NOT EXISTS page_url TEXT;

-- Add device_info column for auto-captured context
ALTER TABLE feedback_messages ADD COLUMN IF NOT EXISTS device_info TEXT;
