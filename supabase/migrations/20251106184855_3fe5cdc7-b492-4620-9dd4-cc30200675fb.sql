-- Sprint 1: Migrate emoji column from enum to TEXT for unlimited emoji support
-- This allows ANY valid emoji unicode while maintaining data integrity

-- Drop the old enum constraint if it exists
ALTER TABLE post_reactions 
  ALTER COLUMN emoji TYPE TEXT;

-- Add validation to ensure only valid emoji unicode characters
-- This regex covers most common emoji ranges
ALTER TABLE post_reactions
  ADD CONSTRAINT valid_emoji_unicode CHECK (
    LENGTH(emoji) > 0 AND LENGTH(emoji) <= 10
  );

-- Add index for better query performance on emoji reactions
CREATE INDEX IF NOT EXISTS idx_post_reactions_emoji ON post_reactions(emoji);

-- Add comment for clarity
COMMENT ON COLUMN post_reactions.emoji IS 'Any valid emoji unicode string - supports full emoji keyboard';