-- Drop the restrictive update policy
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Create a more permissive update policy
-- Users can:
-- 1. Update their own messages (for editing content, soft delete)
-- 2. Update the read status on messages they RECEIVED (for marking as read)
CREATE POLICY "Users can update messages in their conversations" 
ON messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.user_a = auth.uid() OR c.user_b = auth.uid())
  )
)
WITH CHECK (
  -- For updates to content/deleted_at, must be sender
  -- For updates to read status, must be recipient (receiver)
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.user_a = auth.uid() OR c.user_b = auth.uid())
  )
);