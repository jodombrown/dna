-- Add moderation fields to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS flagged_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS flag_reason TEXT,
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'pending', 'rejected', 'flagged')),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- Add moderation fields to post_comments table
ALTER TABLE post_comments
ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS flagged_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS flag_reason TEXT,
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'pending', 'rejected', 'flagged')),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- Create index for moderation queries
CREATE INDEX IF NOT EXISTS idx_posts_moderation_status ON posts(moderation_status) WHERE moderation_status IN ('pending', 'flagged');
CREATE INDEX IF NOT EXISTS idx_comments_moderation_status ON post_comments(moderation_status) WHERE moderation_status IN ('pending', 'flagged');

-- Create a function to flag content
CREATE OR REPLACE FUNCTION flag_content(
  content_type TEXT,
  content_id UUID,
  reason TEXT
) RETURNS void AS $$
BEGIN
  IF content_type = 'post' THEN
    UPDATE posts
    SET 
      flagged_at = NOW(),
      flagged_by = auth.uid(),
      flag_reason = reason,
      moderation_status = 'flagged'
    WHERE id = content_id;
  ELSIF content_type = 'comment' THEN
    UPDATE post_comments
    SET 
      flagged_at = NOW(),
      flagged_by = auth.uid(),
      flag_reason = reason,
      moderation_status = 'flagged'
    WHERE id = content_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION flag_content TO authenticated;