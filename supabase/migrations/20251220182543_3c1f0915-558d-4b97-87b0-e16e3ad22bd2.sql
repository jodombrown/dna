-- =============================================
-- DNA FEEDBACK HUB - Database Schema
-- PRD: FEEDBACK_HUB v1.0
-- =============================================

-- 1. Feedback Channels (system-managed)
CREATE TABLE public.feedback_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Feedback Channel Memberships
CREATE TABLE public.feedback_channel_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.feedback_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'opted_out')),
  last_read_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- 3. Feedback Messages
CREATE TABLE public.feedback_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.feedback_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.feedback_messages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'voice', 'video')),
  category TEXT CHECK (category IN ('bug', 'feature', 'ux', 'general', 'praise')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'in_progress', 'resolved', 'closed')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_pinned BOOLEAN DEFAULT false,
  is_highlighted BOOLEAN DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Feedback Attachments
CREATE TABLE public.feedback_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.feedback_messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Feedback Reactions
CREATE TABLE public.feedback_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.feedback_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('👍', '❤️', '🎉', '🔥', '👀', '💡')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_feedback_messages_channel_id ON public.feedback_messages(channel_id);
CREATE INDEX idx_feedback_messages_sender_id ON public.feedback_messages(sender_id);
CREATE INDEX idx_feedback_messages_parent_id ON public.feedback_messages(parent_id);
CREATE INDEX idx_feedback_messages_status ON public.feedback_messages(status);
CREATE INDEX idx_feedback_messages_created_at ON public.feedback_messages(created_at DESC);
CREATE INDEX idx_feedback_memberships_user_id ON public.feedback_channel_memberships(user_id);
CREATE INDEX idx_feedback_reactions_message_id ON public.feedback_reactions(message_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.feedback_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_channel_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_reactions ENABLE ROW LEVEL SECURITY;

-- Channels: All authenticated users can read active channels
CREATE POLICY "Anyone can view active feedback channels"
  ON public.feedback_channels FOR SELECT
  USING (is_active = true);

-- Memberships: Users can see and manage their own membership
CREATE POLICY "Users can view their own membership"
  ON public.feedback_channel_memberships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own membership"
  ON public.feedback_channel_memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership"
  ON public.feedback_channel_memberships FOR UPDATE
  USING (auth.uid() = user_id);

-- Messages: Active members can view messages, anyone authenticated can post
CREATE POLICY "Active members can view feedback messages"
  ON public.feedback_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.feedback_channel_memberships
      WHERE channel_id = feedback_messages.channel_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Active members can send feedback messages"
  ON public.feedback_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.feedback_channel_memberships
      WHERE channel_id = feedback_messages.channel_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Users can update their own messages (for edits), admins can update any
CREATE POLICY "Users can update their own messages"
  ON public.feedback_messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- Attachments: Same as messages
CREATE POLICY "Members can view attachments"
  ON public.feedback_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.feedback_messages m
      JOIN public.feedback_channel_memberships mem ON mem.channel_id = m.channel_id
      WHERE m.id = feedback_attachments.message_id
        AND mem.user_id = auth.uid()
        AND mem.status = 'active'
    )
  );

CREATE POLICY "Members can upload attachments"
  ON public.feedback_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.feedback_messages m
      WHERE m.id = feedback_attachments.message_id
        AND m.sender_id = auth.uid()
    )
  );

-- Reactions: Members can view and manage reactions
CREATE POLICY "Members can view reactions"
  ON public.feedback_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.feedback_messages m
      JOIN public.feedback_channel_memberships mem ON mem.channel_id = m.channel_id
      WHERE m.id = feedback_reactions.message_id
        AND mem.user_id = auth.uid()
        AND mem.status = 'active'
    )
  );

CREATE POLICY "Users can add reactions"
  ON public.feedback_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions"
  ON public.feedback_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Check if user is feedback admin (platform owner)
CREATE OR REPLACE FUNCTION public.is_feedback_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-join user to default feedback channel
CREATE OR REPLACE FUNCTION public.auto_join_feedback_channel()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.feedback_channel_memberships (channel_id, user_id, status)
  SELECT id, NEW.id, 'active'
  FROM public.feedback_channels
  WHERE is_default = true AND is_active = true
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-join new users
CREATE TRIGGER on_auth_user_created_join_feedback
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_join_feedback_channel();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feedback_channels_timestamp
  BEFORE UPDATE ON public.feedback_channels
  FOR EACH ROW EXECUTE FUNCTION public.update_feedback_updated_at();

CREATE TRIGGER update_feedback_memberships_timestamp
  BEFORE UPDATE ON public.feedback_channel_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_feedback_updated_at();

CREATE TRIGGER update_feedback_messages_timestamp
  BEFORE UPDATE ON public.feedback_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_feedback_updated_at();

-- =============================================
-- SEED DEFAULT CHANNEL
-- =============================================
INSERT INTO public.feedback_channels (name, description, is_default, is_active)
VALUES ('DNA Feedback Hub', 'Share your feedback, ideas, and suggestions to help us build DNA for the diaspora.', true, true);

-- =============================================
-- ADMIN POLICIES (for platform owner)
-- =============================================

-- Admins can update any message (for status, priority, category changes)
CREATE POLICY "Admins can update any feedback message"
  ON public.feedback_messages FOR UPDATE
  USING (public.is_feedback_admin());

-- Admins can view all memberships
CREATE POLICY "Admins can view all memberships"
  ON public.feedback_channel_memberships FOR SELECT
  USING (public.is_feedback_admin());