-- Check if read_by column exists and add it if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'read_by'
    ) THEN
        ALTER TABLE public.messages ADD COLUMN read_by UUID[] DEFAULT '{}';
    END IF;
END $$;

-- Ensure proper foreign key relationships exist
DO $$
BEGIN
    -- Add foreign key for conversations.user_1_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversations_user_1_id_fkey'
    ) THEN
        ALTER TABLE public.conversations
        ADD CONSTRAINT conversations_user_1_id_fkey 
        FOREIGN KEY (user_1_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for conversations.user_2_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversations_user_2_id_fkey'
    ) THEN
        ALTER TABLE public.conversations
        ADD CONSTRAINT conversations_user_2_id_fkey 
        FOREIGN KEY (user_2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for messages.sender_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_sender_id_fkey'
    ) THEN
        ALTER TABLE public.messages
        ADD CONSTRAINT messages_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;