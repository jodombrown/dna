-- Add read_by column to messages table
ALTER TABLE public.messages ADD COLUMN read_by UUID[] DEFAULT '{}';

-- Add foreign key constraints to improve relationships
ALTER TABLE public.conversations
ADD CONSTRAINT conversations_user_1_id_fkey 
FOREIGN KEY (user_1_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.conversations
ADD CONSTRAINT conversations_user_2_id_fkey 
FOREIGN KEY (user_2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.messages
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;