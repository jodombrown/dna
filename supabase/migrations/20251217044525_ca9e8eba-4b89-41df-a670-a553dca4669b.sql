-- Fix the INSERT policy for post_reactions to include WITH CHECK clause
DROP POLICY IF EXISTS "Users can add their own reactions" ON public.post_reactions;

CREATE POLICY "Users can add their own reactions"
ON public.post_reactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);