-- Fix RLS policy for conversation_participants to allow seeing all participants in a conversation you're part of
DROP POLICY IF EXISTS "cp_select_own" ON conversation_participants;

CREATE POLICY "cp_select_conversation_members" 
ON conversation_participants
FOR SELECT
USING (
  conversation_id IN (
    SELECT cp_inner.conversation_id 
    FROM conversation_participants cp_inner
    WHERE cp_inner.user_id = (SELECT auth.uid())
  )
);