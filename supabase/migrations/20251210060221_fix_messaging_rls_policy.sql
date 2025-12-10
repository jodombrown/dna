-- =====================================================
-- FIX: conversation_participants RLS Policy
-- =====================================================
-- The current "cp_select_own" policy is too restrictive.
-- Users can only see their own participant row, which breaks
-- get_conversation_details() and get_user_conversations()
-- because they can't see the OTHER participant's row to fetch
-- their profile info.
--
-- FIX: Allow users to see ALL participants in conversations
-- they belong to (not just their own row).
-- =====================================================

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "cp_select_own" ON conversation_participants;

-- Create a policy that allows viewing all participants in your conversations
-- This is safe because:
-- 1. You can only see participants in conversations you're already a member of
-- 2. This is necessary to show "who you're talking to"
CREATE POLICY "cp_select_conversation_members"
ON conversation_participants
FOR SELECT
USING (
  conversation_id IN (
    SELECT cp.conversation_id
    FROM conversation_participants cp
    WHERE cp.user_id = (SELECT auth.uid())
  )
);

-- Also ensure the update policy exists for updating own participant record
DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants;
CREATE POLICY "cp_update_own"
ON conversation_participants
FOR UPDATE
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));
