-- Add pinned_at column to post_bookmarks for pinned saved items
ALTER TABLE post_bookmarks 
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ DEFAULT NULL;

-- Create index for faster pinned bookmark queries
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_pinned 
ON post_bookmarks(user_id, pinned_at) 
WHERE pinned_at IS NOT NULL;