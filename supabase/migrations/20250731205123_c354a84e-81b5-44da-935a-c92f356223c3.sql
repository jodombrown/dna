-- Create group_conversations table (multi-participant conversations)
CREATE TABLE IF NOT EXISTS public.group_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  participant_ids uuid[] NOT NULL,
  last_message_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Create group_messages table  
CREATE TABLE IF NOT EXISTS public.group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.group_conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.group_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for group_conversations
CREATE POLICY "Users can view group conversations they participate in"
ON public.group_conversations FOR SELECT
USING (auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can create group conversations they participate in"
ON public.group_conversations FOR INSERT
WITH CHECK (auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can update group conversations they participate in"
ON public.group_conversations FOR UPDATE
USING (auth.uid() = ANY(participant_ids));

-- RLS policies for group_messages
CREATE POLICY "Users can view messages in their group conversations"
ON public.group_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_conversations 
    WHERE id = group_messages.conversation_id 
    AND auth.uid() = ANY(participant_ids)
  )
);

CREATE POLICY "Users can create messages in their group conversations"
ON public.group_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.group_conversations 
    WHERE id = group_messages.conversation_id 
    AND auth.uid() = ANY(participant_ids)
  )
);

-- Update group conversation timestamp trigger
CREATE OR REPLACE FUNCTION public.update_group_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.group_conversations 
  SET last_message_at = NEW.created_at, updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_group_conversation_timestamp
  AFTER INSERT ON public.group_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_group_conversation_last_message();