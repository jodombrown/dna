-- Add DELETE policy for notifications so users can delete their own notifications
CREATE POLICY "notifications_delete" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);