
-- Enable real-time updates for the messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add the messages table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable RLS if not already enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages they received" ON public.messages;

-- Policy: Users can send messages (insert)
CREATE POLICY "Users can send messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can mark their received messages as read
CREATE POLICY "Users can update messages they received" 
  ON public.messages 
  FOR UPDATE 
  USING (auth.uid() = recipient_id);

-- Create indexes for better performance on message queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation 
  ON public.messages (sender_id, recipient_id, created_at DESC);

-- Create an index for unread messages
CREATE INDEX IF NOT EXISTS idx_messages_unread 
  ON public.messages (recipient_id, is_read, created_at DESC);
