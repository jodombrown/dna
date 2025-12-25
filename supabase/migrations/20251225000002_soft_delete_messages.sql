-- Add soft delete functionality for messages
-- Feature 1: Messaging (85% → 100%)

-- 1. Add deleted_at column to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Create index for efficient queries (exclude deleted messages)
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at
  ON public.messages(deleted_at)
  WHERE deleted_at IS NULL;

-- 3. Create soft delete RPC function
CREATE OR REPLACE FUNCTION public.soft_delete_message(p_message_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow deleting own messages
  UPDATE public.messages
  SET deleted_at = now()
  WHERE id = p_message_id
  AND sender_id = auth.uid()
  AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message not found or you do not have permission to delete it';
  END IF;
END;
$$;

-- 4. Grant execute permission
GRANT EXECUTE ON FUNCTION public.soft_delete_message(UUID) TO authenticated;
