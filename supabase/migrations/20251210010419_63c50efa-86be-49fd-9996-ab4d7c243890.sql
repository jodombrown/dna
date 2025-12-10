-- Create security definer function to check conversation participation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conversation_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id
      AND user_id = p_user_id
  )
$$;

-- Drop the existing recursive INSERT policy
DROP POLICY IF EXISTS "conversation_participants_insert" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations they created or were invited to" ON public.conversation_participants;

-- Create new non-recursive INSERT policy
-- Users can insert themselves as participants (for new conversations they create)
CREATE POLICY "conversation_participants_insert_fixed"
ON public.conversation_participants
FOR INSERT
WITH CHECK (user_id = (SELECT auth.uid()));