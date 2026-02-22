-- Sprint 11: Feed Engagement Tables
-- Migration: Feed Reactions, Comments, Bookmarks, Reshares

-- ============================================================
-- 1. FEED REACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS feed_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'event', 'opportunity', 'space', 'story')),
  content_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('asante', 'inspired', 'lets_build', 'powerful', 'insightful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id, content_type)
);

ALTER TABLE feed_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reactions" ON feed_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users manage own reactions" ON feed_reactions
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feed_reactions_content
  ON feed_reactions(content_type, content_id);

CREATE INDEX IF NOT EXISTS idx_feed_reactions_user
  ON feed_reactions(user_id, created_at DESC);

-- ============================================================
-- 2. FEED COMMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES feed_comments(id),
  body TEXT NOT NULL CHECK (char_length(body) > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feed_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON feed_comments
  FOR SELECT USING (true);

CREATE POLICY "Users manage own comments" ON feed_comments
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feed_comments_content
  ON feed_comments(content_type, content_id, created_at);

CREATE INDEX IF NOT EXISTS idx_feed_comments_parent
  ON feed_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- ============================================================
-- 3. FEED BOOKMARKS
-- ============================================================

CREATE TABLE IF NOT EXISTS feed_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id, content_type)
);

ALTER TABLE feed_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own bookmarks" ON feed_bookmarks
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feed_bookmarks_user
  ON feed_bookmarks(user_id, content_type);

-- ============================================================
-- 4. FEED RESHARES
-- ============================================================

CREATE TABLE IF NOT EXISTS feed_reshares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  commentary TEXT,
  shared_via TEXT NOT NULL CHECK (shared_via IN ('feed', 'message', 'link')),
  shared_to_conversation_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feed_reshares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feed reshares" ON feed_reshares
  FOR SELECT USING (shared_via = 'feed');

CREATE POLICY "Users manage own reshares" ON feed_reshares
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feed_reshares_content
  ON feed_reshares(content_type, content_id);

CREATE INDEX IF NOT EXISTS idx_feed_reshares_user
  ON feed_reshares(user_id, created_at DESC);
