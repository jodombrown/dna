-- Add DELETE policy for messages table
-- Users can only delete their own messages
CREATE POLICY "Users can delete their own messages"
ON public.messages
FOR DELETE
USING (sender_id = auth.uid());