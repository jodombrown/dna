-- Add payload column to messages table for attachments and link previews
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT NULL;