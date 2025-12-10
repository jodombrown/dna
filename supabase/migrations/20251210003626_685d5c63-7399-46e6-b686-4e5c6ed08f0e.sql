-- Fix conversation_participants INSERT policy to allow adding other participants
-- when creating a new conversation

-- Drop the restrictive policy
DROP POLICY IF EXISTS "conversation_participants_insert" ON conversation_participants;

-- Create new policy: users can add participants if they're also in the conversation
CREATE POLICY "Users can add participants to conversations they join"
ON conversation_participants
FOR INSERT
WITH CHECK (
  -- User can always insert themselves
  user_id = (SELECT auth.uid())
  OR 
  -- OR user can insert another participant if they're already in the same conversation
  EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = conversation_participants.conversation_id 
    AND cp.user_id = (SELECT auth.uid())
  )
);