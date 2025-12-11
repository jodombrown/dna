-- =====================================================
-- TIER 3 MESSAGING ENHANCEMENTS: Reactions, Search, Archive/Mute, Voice
-- =====================================================

-- 1. MESSAGE REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS on message_reactions
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_reactions
CREATE POLICY "Users can view reactions in their conversations"
ON public.message_reactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversations c ON m.conversation_id = c.id
    WHERE m.id = message_reactions.message_id
    AND ((SELECT auth.uid()) = c.user_a OR (SELECT auth.uid()) = c.user_b)
  )
);

CREATE POLICY "Users can add reactions to messages in their conversations"
ON public.message_reactions FOR INSERT
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversations c ON m.conversation_id = c.id
    WHERE m.id = message_reactions.message_id
    AND ((SELECT auth.uid()) = c.user_a OR (SELECT auth.uid()) = c.user_b)
  )
);

CREATE POLICY "Users can remove their own reactions"
ON public.message_reactions FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- Index for faster reaction lookups
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);

-- 2. ADD ARCHIVE/MUTE COLUMNS TO CONVERSATIONS
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS is_archived_by_a BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_archived_by_b BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_muted_by_a BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_muted_by_b BOOLEAN DEFAULT false;

-- 3. FULL TEXT SEARCH INDEX ON MESSAGES
CREATE INDEX IF NOT EXISTS idx_messages_content_search 
ON public.messages USING gin(to_tsvector('english', content));