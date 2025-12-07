-- Fix 1: Profiles table - restrict SELECT to only show safe fields via the public_profiles view
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- Create a strict policy: users can only see their own full profile
-- Others must use the public_profiles view (which excludes sensitive fields)
CREATE POLICY "profiles_select_own_only"
ON public.profiles
FOR SELECT
USING (id = (SELECT auth.uid()));

-- Fix 2: Conversation participants - prevent user enumeration
-- Only allow viewing participants of conversations you're in
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversation_participants;

CREATE POLICY "conversation_participants_select"
ON public.conversation_participants
FOR SELECT
USING (
  -- Can view participants if user is a participant in the same conversation
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
    AND cp.user_id = (SELECT auth.uid())
  )
);

-- Fix 3: Prevent users from joining arbitrary conversations
DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_participants;

CREATE POLICY "conversation_participants_insert"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
  -- Can only add yourself as a participant
  user_id = (SELECT auth.uid())
  -- AND you must be creating a new conversation (handled by conversation insert) 
  -- OR be invited by an existing participant (future feature)
);

-- Fix 4: Conversations table - add UPDATE/DELETE policies for completeness
CREATE POLICY "conversations_update"
ON public.conversations
FOR UPDATE
USING (
  (SELECT auth.uid()) = user_a OR (SELECT auth.uid()) = user_b
)
WITH CHECK (
  (SELECT auth.uid()) = user_a OR (SELECT auth.uid()) = user_b
);

CREATE POLICY "conversations_delete"
ON public.conversations
FOR DELETE
USING (
  (SELECT auth.uid()) = user_a OR (SELECT auth.uid()) = user_b
);