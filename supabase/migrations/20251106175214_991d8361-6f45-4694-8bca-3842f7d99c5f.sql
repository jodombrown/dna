-- Add repost/share support to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS original_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS shared_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS share_commentary TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_original_post_id ON posts(original_post_id) WHERE original_post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_shared_by ON posts(shared_by) WHERE shared_by IS NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN posts.original_post_id IS 'Reference to the original post if this is a repost/share';
COMMENT ON COLUMN posts.shared_by IS 'User who shared this post (for reposts)';
COMMENT ON COLUMN posts.share_commentary IS 'Optional commentary added when sharing a post';