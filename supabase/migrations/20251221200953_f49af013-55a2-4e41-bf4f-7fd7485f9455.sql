-- Fix duplicate/conflicting SELECT policies on feedback_messages
-- Drop duplicate policies and consolidate into one optimized policy

-- Drop the duplicate policies
DROP POLICY IF EXISTS "Members can view messages" ON public.feedback_messages;
DROP POLICY IF EXISTS "Active members can view feedback messages" ON public.feedback_messages;
DROP POLICY IF EXISTS "Admin can view all messages" ON public.feedback_messages;

-- Create single optimized SELECT policy that:
-- 1. Uses (select auth.uid()) for performance
-- 2. Checks is_deleted = false for regular members
-- 3. Allows admins to see all messages
CREATE POLICY "Members can view feedback messages" 
ON public.feedback_messages 
FOR SELECT 
USING (
  -- Admins can see everything
  is_feedback_admin()
  OR
  -- Regular members can see non-deleted messages in channels they belong to
  (
    is_deleted = false 
    AND EXISTS (
      SELECT 1 FROM feedback_channel_memberships fcm
      WHERE fcm.channel_id = feedback_messages.channel_id
      AND fcm.user_id = (SELECT auth.uid())
      AND fcm.status = 'active'
    )
  )
);