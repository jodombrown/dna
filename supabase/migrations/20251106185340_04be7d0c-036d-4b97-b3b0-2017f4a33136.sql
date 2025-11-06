-- Phase 1.3: Post Bookmarks - Database Schema

-- Create post_bookmarks table
CREATE TABLE post_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  folder TEXT, -- For future organization (v2)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate bookmarks
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON post_bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON post_bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON post_bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX idx_bookmarks_user_id ON post_bookmarks(user_id);
CREATE INDEX idx_bookmarks_post_id ON post_bookmarks(post_id);
CREATE INDEX idx_bookmarks_created_at ON post_bookmarks(created_at DESC);
CREATE INDEX idx_bookmarks_folder ON post_bookmarks(folder) WHERE folder IS NOT NULL;

-- Comments for clarity
COMMENT ON TABLE post_bookmarks IS 'User-saved posts for later reading';
COMMENT ON COLUMN post_bookmarks.folder IS 'Optional folder for organizing bookmarks (future feature)';
COMMENT ON COLUMN post_bookmarks.created_at IS 'When the post was bookmarked';