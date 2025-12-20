-- Add missing user_tag column to feedback_messages
ALTER TABLE feedback_messages 
ADD COLUMN IF NOT EXISTS user_tag text;

-- Add comment for documentation
COMMENT ON COLUMN feedback_messages.user_tag IS 'User-provided tag: bug, suggestion, question, praise, other';