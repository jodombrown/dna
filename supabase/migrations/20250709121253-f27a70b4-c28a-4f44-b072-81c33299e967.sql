
-- Add attachments support to messages table
ALTER TABLE public.messages 
ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;

-- Create message_reactions table for emoji reactions
CREATE TABLE public.message_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  reaction text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, reaction)
);

-- Enable RLS on message_reactions
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for message_reactions
CREATE POLICY "Users can view reactions in their conversations" 
ON public.message_reactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.messages m 
    JOIN public.conversations c ON m.conversation_id = c.id
    WHERE m.id = message_reactions.message_id 
    AND (c.user_1_id = auth.uid() OR c.user_2_id = auth.uid())
  )
);

CREATE POLICY "Users can create reactions in their conversations" 
ON public.message_reactions FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.messages m 
    JOIN public.conversations c ON m.conversation_id = c.id
    WHERE m.id = message_reactions.message_id 
    AND (c.user_1_id = auth.uid() OR c.user_2_id = auth.uid())
  )
);

CREATE POLICY "Users can delete their own reactions" 
ON public.message_reactions FOR DELETE 
USING (auth.uid() = user_id);

-- Enable realtime for messages and conversations
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
BEGIN;
  -- Remove tables if they already exist in the publication
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.messages;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.conversations;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.message_reactions;
  
  -- Add tables to realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
COMMIT;

-- Add indexes for better performance
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
