-- ============================================
-- DNA FEEDBACK HUB DATABASE SCHEMA
-- ============================================

-- 1. Feedback Channels (Global channels, MVP: single "DNA | Feedback Hub" channel)
CREATE TABLE IF NOT EXISTS public.feedback_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Feedback Channel Memberships (All users auto-joined, can opt-out)
CREATE TABLE IF NOT EXISTS public.feedback_channel_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES feedback_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'opted_out', 'muted')),
    joined_at TIMESTAMPTZ DEFAULT now(),
    opted_out_at TIMESTAMPTZ,
    last_read_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(channel_id, user_id)
);

-- 3. Feedback Messages (Core message storage)
CREATE TABLE IF NOT EXISTS public.feedback_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES feedback_channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Content
    content TEXT,
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'voice', 'video', 'mixed')),

    -- Threading
    parent_message_id UUID REFERENCES feedback_messages(id) ON DELETE SET NULL,
    reply_count INTEGER DEFAULT 0,

    -- Tagging (user-applied)
    user_tag TEXT CHECK (user_tag IN ('bug', 'suggestion', 'question', 'praise', 'other')),

    -- Admin categorization
    admin_category TEXT CHECK (admin_category IN ('bug', 'feature_request', 'ux_issue', 'question', 'duplicate', 'other')),
    admin_status TEXT DEFAULT 'open' CHECK (admin_status IN ('open', 'in_progress', 'resolved', 'wont_fix')),
    admin_priority TEXT CHECK (admin_priority IN ('low', 'medium', 'high', 'critical')),

    -- Admin actions
    is_pinned BOOLEAN DEFAULT false,
    is_highlighted BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id),

    -- Admin response tracking
    first_response_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Feedback Attachments (Media files)
CREATE TABLE IF NOT EXISTS public.feedback_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES feedback_messages(id) ON DELETE CASCADE,

    attachment_type TEXT NOT NULL CHECK (attachment_type IN ('image', 'voice', 'video')),
    storage_path TEXT NOT NULL,
    file_name TEXT,
    file_size_bytes INTEGER,
    mime_type TEXT,
    duration_seconds INTEGER,
    width INTEGER,
    height INTEGER,
    thumbnail_path TEXT,

    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Feedback Reactions (Emoji reactions)
CREATE TABLE IF NOT EXISTS public.feedback_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES feedback_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL CHECK (emoji IN ('👍', '❤️', '🔥', '👀', '✅')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(message_id, user_id, emoji)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_feedback_messages_channel ON feedback_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_sender ON feedback_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_parent ON feedback_messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_status ON feedback_messages(admin_status);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_created ON feedback_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_pinned ON feedback_messages(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_feedback_attachments_message ON feedback_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reactions_message ON feedback_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_feedback_memberships_user ON feedback_channel_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_memberships_channel ON feedback_channel_memberships(channel_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Check if user is feedback admin (platform owner)
CREATE OR REPLACE FUNCTION public.is_feedback_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = _user_id AND role = 'admin'
    )
$$;

-- Auto-join user to default channel on signup (trigger)
CREATE OR REPLACE FUNCTION public.auto_join_feedback_channel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO feedback_channel_memberships (channel_id, user_id)
    SELECT id, NEW.id
    FROM feedback_channels
    WHERE is_active = true AND slug = 'feedback-hub'
    ON CONFLICT (channel_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_profile_created_join_feedback ON profiles;
CREATE TRIGGER on_profile_created_join_feedback
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION auto_join_feedback_channel();

-- Update reply count on parent message
CREATE OR REPLACE FUNCTION public.update_feedback_reply_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_message_id IS NOT NULL THEN
        UPDATE feedback_messages
        SET reply_count = reply_count + 1
        WHERE id = NEW.parent_message_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_message_id IS NOT NULL THEN
        UPDATE feedback_messages
        SET reply_count = reply_count - 1
        WHERE id = OLD.parent_message_id;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS feedback_reply_count_trigger ON feedback_messages;
CREATE TRIGGER feedback_reply_count_trigger
AFTER INSERT OR DELETE ON feedback_messages
FOR EACH ROW
EXECUTE FUNCTION update_feedback_reply_count();

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_feedback_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS feedback_channels_updated_at ON feedback_channels;
CREATE TRIGGER feedback_channels_updated_at
BEFORE UPDATE ON feedback_channels
FOR EACH ROW EXECUTE FUNCTION update_feedback_updated_at();

DROP TRIGGER IF EXISTS feedback_messages_updated_at ON feedback_messages;
CREATE TRIGGER feedback_messages_updated_at
BEFORE UPDATE ON feedback_messages
FOR EACH ROW EXECUTE FUNCTION update_feedback_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE feedback_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_channel_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_reactions ENABLE ROW LEVEL SECURITY;

-- Feedback Channels: All authenticated can view active channels
DROP POLICY IF EXISTS "Anyone can view active channels" ON feedback_channels;
CREATE POLICY "Anyone can view active channels"
ON feedback_channels FOR SELECT
TO authenticated
USING (is_active = true);

-- Only admin can manage channels
DROP POLICY IF EXISTS "Admin can manage channels" ON feedback_channels;
CREATE POLICY "Admin can manage channels"
ON feedback_channels FOR ALL
TO authenticated
USING (is_feedback_admin(auth.uid()))
WITH CHECK (is_feedback_admin(auth.uid()));

-- Memberships: Users can view/manage their own
DROP POLICY IF EXISTS "Users can view own membership" ON feedback_channel_memberships;
CREATE POLICY "Users can view own membership"
ON feedback_channel_memberships FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own membership" ON feedback_channel_memberships;
CREATE POLICY "Users can update own membership"
ON feedback_channel_memberships FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert memberships" ON feedback_channel_memberships;
CREATE POLICY "System can insert memberships"
ON feedback_channel_memberships FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Messages: Active members can view non-deleted messages
DROP POLICY IF EXISTS "Members can view messages" ON feedback_messages;
CREATE POLICY "Members can view messages"
ON feedback_messages FOR SELECT
TO authenticated
USING (
    is_deleted = false
    AND EXISTS (
        SELECT 1 FROM feedback_channel_memberships
        WHERE channel_id = feedback_messages.channel_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
);

-- Admin can view all messages including deleted
DROP POLICY IF EXISTS "Admin can view all messages" ON feedback_messages;
CREATE POLICY "Admin can view all messages"
ON feedback_messages FOR SELECT
TO authenticated
USING (is_feedback_admin(auth.uid()));

-- Members can insert messages
DROP POLICY IF EXISTS "Members can send messages" ON feedback_messages;
CREATE POLICY "Members can send messages"
ON feedback_messages FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM feedback_channel_memberships
        WHERE channel_id = feedback_messages.channel_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
);

-- Admin can update any message (for status, pin, delete)
DROP POLICY IF EXISTS "Admin can update messages" ON feedback_messages;
CREATE POLICY "Admin can update messages"
ON feedback_messages FOR UPDATE
TO authenticated
USING (is_feedback_admin(auth.uid()))
WITH CHECK (is_feedback_admin(auth.uid()));

-- Attachments: Same access as messages
DROP POLICY IF EXISTS "Members can view attachments" ON feedback_attachments;
CREATE POLICY "Members can view attachments"
ON feedback_attachments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM feedback_messages m
        JOIN feedback_channel_memberships mem ON m.channel_id = mem.channel_id
        WHERE m.id = feedback_attachments.message_id
        AND mem.user_id = auth.uid()
        AND mem.status = 'active'
        AND m.is_deleted = false
    )
);

DROP POLICY IF EXISTS "Members can insert attachments" ON feedback_attachments;
CREATE POLICY "Members can insert attachments"
ON feedback_attachments FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM feedback_messages m
        WHERE m.id = feedback_attachments.message_id
        AND m.sender_id = auth.uid()
    )
);

-- Reactions: Members can view and manage
DROP POLICY IF EXISTS "Members can view reactions" ON feedback_reactions;
CREATE POLICY "Members can view reactions"
ON feedback_reactions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM feedback_messages m
        JOIN feedback_channel_memberships mem ON m.channel_id = mem.channel_id
        WHERE m.id = feedback_reactions.message_id
        AND mem.user_id = auth.uid()
        AND mem.status = 'active'
    )
);

DROP POLICY IF EXISTS "Members can add reactions" ON feedback_reactions;
CREATE POLICY "Members can add reactions"
ON feedback_reactions FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM feedback_messages m
        JOIN feedback_channel_memberships mem ON m.channel_id = mem.channel_id
        WHERE m.id = feedback_reactions.message_id
        AND mem.user_id = auth.uid()
        AND mem.status = 'active'
    )
);

DROP POLICY IF EXISTS "Users can remove own reactions" ON feedback_reactions;
CREATE POLICY "Users can remove own reactions"
ON feedback_reactions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- STORAGE BUCKET
-- ============================================

-- Create storage bucket for feedback media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'feedback-media',
    'feedback-media',
    false,
    52428800,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/webm', 'audio/mp4', 'audio/mpeg', 'video/webm', 'video/mp4']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Authenticated users can upload feedback media" ON storage.objects;
CREATE POLICY "Authenticated users can upload feedback media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'feedback-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Authenticated users can view feedback media" ON storage.objects;
CREATE POLICY "Authenticated users can view feedback media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'feedback-media');

-- ============================================
-- SEED DATA
-- ============================================

-- Create default feedback channel
INSERT INTO feedback_channels (name, description, slug, is_active)
VALUES (
    'DNA | Feedback Hub',
    'Share your feedback, report bugs, suggest features, and help us build DNA together!',
    'feedback-hub',
    true
) ON CONFLICT (slug) DO NOTHING;

-- Auto-join existing users to the feedback channel
INSERT INTO feedback_channel_memberships (channel_id, user_id)
SELECT fc.id, p.id
FROM feedback_channels fc
CROSS JOIN profiles p
WHERE fc.slug = 'feedback-hub'
ON CONFLICT (channel_id, user_id) DO NOTHING;
