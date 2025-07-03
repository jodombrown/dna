
-- Add file attachments support to messages
ALTER TABLE public.messages 
ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;

-- Create group conversations table
CREATE TABLE public.group_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  member_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true
);

-- Create group conversation members table
CREATE TABLE public.group_conversation_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_conversation_id UUID REFERENCES public.group_conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(group_conversation_id, user_id)
);

-- Create message read receipts table
CREATE TABLE public.message_read_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(message_id, user_id)
);

-- Add group conversation support to messages
ALTER TABLE public.messages 
ADD COLUMN group_conversation_id UUID REFERENCES public.group_conversations(id) ON DELETE CASCADE,
ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
ADD CONSTRAINT messages_conversation_check 
  CHECK ((conversation_id IS NOT NULL AND group_conversation_id IS NULL) OR 
         (conversation_id IS NULL AND group_conversation_id IS NOT NULL));

-- Enable RLS on new tables
ALTER TABLE public.group_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS policies for group_conversations
CREATE POLICY "Users can view group conversations they are members of" 
  ON public.group_conversations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_conversation_members 
      WHERE group_conversation_id = group_conversations.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create group conversations" 
  ON public.group_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update conversations" 
  ON public.group_conversations 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_conversation_members 
      WHERE group_conversation_id = group_conversations.id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS policies for group_conversation_members
CREATE POLICY "Users can view group members if they are members" 
  ON public.group_conversation_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_conversation_members gcm 
      WHERE gcm.group_conversation_id = group_conversation_members.group_conversation_id 
      AND gcm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can add members" 
  ON public.group_conversation_members 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_conversation_members 
      WHERE group_conversation_id = group_conversation_members.group_conversation_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    ) OR auth.uid() = user_id
  );

CREATE POLICY "Users can leave groups or admins can remove members" 
  ON public.group_conversation_members 
  FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.group_conversation_members 
      WHERE group_conversation_id = group_conversation_members.group_conversation_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS policies for message_read_receipts
CREATE POLICY "Users can view read receipts for their messages or conversations" 
  ON public.message_read_receipts 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.messages m 
      WHERE m.id = message_read_receipts.message_id 
      AND (
        m.sender_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.conversations c 
          WHERE c.id = m.conversation_id 
          AND (c.user_1_id = auth.uid() OR c.user_2_id = auth.uid())
        ) OR
        EXISTS (
          SELECT 1 FROM public.group_conversation_members gcm 
          WHERE gcm.group_conversation_id = m.group_conversation_id 
          AND gcm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create their own read receipts" 
  ON public.message_read_receipts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Update messages RLS policies to include group conversations
DROP POLICY "Users can view messages in their conversations" ON public.messages;
DROP POLICY "Users can create messages in their conversations" ON public.messages;

CREATE POLICY "Users can view messages in their conversations" 
  ON public.messages 
  FOR SELECT 
  USING (
    (conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.user_1_id = auth.uid() OR conversations.user_2_id = auth.uid())
    )) OR
    (group_conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.group_conversation_members 
      WHERE group_conversation_id = messages.group_conversation_id 
      AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create messages in their conversations" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND (
      (conversation_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE conversations.id = messages.conversation_id 
        AND (conversations.user_1_id = auth.uid() OR conversations.user_2_id = auth.uid())
      )) OR
      (group_conversation_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.group_conversation_members 
        WHERE group_conversation_id = messages.group_conversation_id 
        AND user_id = auth.uid()
      ))
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_messages_group_conversation ON public.messages(group_conversation_id, created_at DESC);
CREATE INDEX idx_messages_attachments ON public.messages USING GIN(attachments);
CREATE INDEX idx_group_conversation_members_user ON public.group_conversation_members(user_id);
CREATE INDEX idx_message_read_receipts_message ON public.message_read_receipts(message_id);

-- Function to update group conversation timestamp
CREATE OR REPLACE FUNCTION update_group_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.group_conversation_id IS NOT NULL THEN
    UPDATE public.group_conversations 
    SET last_message_at = NEW.created_at, updated_at = NEW.created_at
    WHERE id = NEW.group_conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Trigger to automatically update group conversation timestamp
CREATE TRIGGER update_group_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_group_conversation_timestamp();

-- Function to automatically create admin membership when group conversation is created
CREATE OR REPLACE FUNCTION create_group_admin_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_conversation_members (user_id, group_conversation_id, role)
  VALUES (NEW.created_by, NEW.id, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Trigger to automatically make creator an admin member
CREATE TRIGGER on_group_conversation_created
  AFTER INSERT ON public.group_conversations
  FOR EACH ROW EXECUTE FUNCTION create_group_admin_membership();
