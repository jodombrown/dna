-- Migration: Add Draft Posts System
-- Enables users to save draft posts and resume writing later

-- Create draft_posts table
CREATE TABLE IF NOT EXISTS draft_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'post',
  media_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT draft_posts_author_fk FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX idx_draft_posts_author ON draft_posts(author_id);
CREATE INDEX idx_draft_posts_updated ON draft_posts(updated_at DESC);

-- Enable RLS
ALTER TABLE draft_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own drafts"
  ON draft_posts
  FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Users can create own drafts"
  ON draft_posts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own drafts"
  ON draft_posts
  FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own drafts"
  ON draft_posts
  FOR DELETE
  USING (auth.uid() = author_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_draft_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER draft_posts_updated_at
  BEFORE UPDATE ON draft_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_draft_posts_updated_at();

-- Function to get user's drafts
CREATE OR REPLACE FUNCTION get_user_drafts(
  p_user_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  content TEXT,
  post_type TEXT,
  media_urls TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.post_type,
    d.media_urls,
    d.created_at,
    d.updated_at
  FROM draft_posts d
  WHERE d.author_id = p_user_id
  ORDER BY d.updated_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant permissions
GRANT ALL ON draft_posts TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_drafts TO authenticated;

-- Add comments
COMMENT ON TABLE draft_posts IS 'Stores draft posts for users to resume writing later';
COMMENT ON FUNCTION get_user_drafts IS 'Gets all draft posts for a user, ordered by most recent';
