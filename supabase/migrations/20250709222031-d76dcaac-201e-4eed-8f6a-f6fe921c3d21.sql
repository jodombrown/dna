-- First, I need to check if message_reactions table exists and create it if needed
-- Create message_reactions table for persisting reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reaction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one reaction per user per message per reaction type
  UNIQUE(message_id, user_id, reaction)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for message reactions
CREATE POLICY "Message reactions are viewable by conversation participants" 
ON public.message_reactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversations c ON c.id = m.conversation_id
    WHERE m.id = message_reactions.message_id
    AND (c.user_1_id = auth.uid() OR c.user_2_id = auth.uid())
  )
);

CREATE POLICY "Users can create message reactions" 
ON public.message_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own message reactions" 
ON public.message_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable real-time for message reactions
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;
SELECT pg_catalog.pg_notify('realtime', json_build_object('table', 'message_reactions')::text);

-- Enable real-time for messages and conversations
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
SELECT pg_catalog.pg_notify('realtime', json_build_object('table', 'messages')::text);
SELECT pg_catalog.pg_notify('realtime', json_build_object('table', 'conversations')::text);

-- Add realtime publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;