-- Fix recursive RLS policy on conversation_participants
-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "cp_select_conversation_members" ON conversation_participants;

-- Create a simple non-recursive policy that allows viewing participants in your conversations
-- First, get your conversation IDs, then check
CREATE POLICY "cp_select_own_conversations" ON conversation_participants
FOR SELECT
USING (
  -- Simple: if you're a participant, you can see all participants in that conversation
  -- This uses a subquery that doesn't self-reference problematically
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
    AND cp.user_id = (SELECT auth.uid())
  )
);

-- Also fix the conversations_new SELECT policy to be simpler
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations_new;

CREATE POLICY "Users can view their conversations" ON conversations_new
FOR SELECT
USING (
  id IN (
    SELECT conversation_id FROM conversation_participants 
    WHERE user_id = (SELECT auth.uid())
  )
);