-- Just enable realtime for messaging tables and add read_by column if needed
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.group_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.group_messages REPLICA IDENTITY FULL;

-- Add read_by column to group_messages if not exists
ALTER TABLE public.group_messages ADD COLUMN IF NOT EXISTS read_by uuid[] DEFAULT '{}'::uuid[];

-- Add tables to realtime publication
DO $$
BEGIN
    -- Add conversations to realtime
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already added to publication
        NULL;
    END;

    -- Add group_conversations to realtime
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.group_conversations;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already added to publication
        NULL;
    END;

    -- Add group_messages to realtime
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already added to publication
        NULL;
    END;
END $$;