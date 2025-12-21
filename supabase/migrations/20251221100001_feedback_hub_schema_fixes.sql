-- ============================================
-- DNA FEEDBACK HUB SCHEMA FIXES
-- Aligns database schema with TypeScript types
-- ============================================
--
-- ROLLBACK INSTRUCTIONS:
-- To rollback this migration, run the following:
-- 1. Rename columns back to original names
-- 2. Drop the is_default column
-- 3. Revert enum constraints
-- See bottom of file for full rollback SQL
-- ============================================

-- ============================================
-- 1. ADD is_default COLUMN TO feedback_channels
-- ============================================

ALTER TABLE public.feedback_channels
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Set the existing 'feedback-hub' channel as default
UPDATE public.feedback_channels
SET is_default = true
WHERE slug = 'feedback-hub';

-- ============================================
-- 2. RENAME COLUMNS IN feedback_messages
-- ============================================

-- parent_message_id → parent_id
ALTER TABLE public.feedback_messages
RENAME COLUMN parent_message_id TO parent_id;

-- content_type → message_type
ALTER TABLE public.feedback_messages
RENAME COLUMN content_type TO message_type;

-- admin_status → status
ALTER TABLE public.feedback_messages
RENAME COLUMN admin_status TO status;

-- admin_category → category
ALTER TABLE public.feedback_messages
RENAME COLUMN admin_category TO category;

-- admin_priority → priority
ALTER TABLE public.feedback_messages
RENAME COLUMN admin_priority TO priority;

-- ============================================
-- 3. RENAME COLUMNS IN feedback_attachments
-- ============================================

-- storage_path → file_url
ALTER TABLE public.feedback_attachments
RENAME COLUMN storage_path TO file_url;

-- attachment_type → file_type
ALTER TABLE public.feedback_attachments
RENAME COLUMN attachment_type TO file_type;

-- file_size_bytes → file_size
ALTER TABLE public.feedback_attachments
RENAME COLUMN file_size_bytes TO file_size;

-- ============================================
-- 4. UPDATE STATUS CONSTRAINT
-- Add 'acknowledged' and 'closed' to allowed values
-- ============================================

-- Drop existing constraint
ALTER TABLE public.feedback_messages
DROP CONSTRAINT IF EXISTS feedback_messages_admin_status_check;

ALTER TABLE public.feedback_messages
DROP CONSTRAINT IF EXISTS feedback_messages_status_check;

-- Add new constraint with all status values
ALTER TABLE public.feedback_messages
ADD CONSTRAINT feedback_messages_status_check
CHECK (status IN ('open', 'acknowledged', 'in_progress', 'resolved', 'closed', 'wont_fix'));

-- ============================================
-- 5. UPDATE CATEGORY CONSTRAINT
-- Add 'feature', 'ux', 'general', 'praise'
-- ============================================

-- Drop existing constraint
ALTER TABLE public.feedback_messages
DROP CONSTRAINT IF EXISTS feedback_messages_admin_category_check;

ALTER TABLE public.feedback_messages
DROP CONSTRAINT IF EXISTS feedback_messages_category_check;

-- Migrate existing data to new values
UPDATE public.feedback_messages SET category = 'feature' WHERE category = 'feature_request';
UPDATE public.feedback_messages SET category = 'ux' WHERE category = 'ux_issue';

-- Add new constraint with all category values
ALTER TABLE public.feedback_messages
ADD CONSTRAINT feedback_messages_category_check
CHECK (category IN ('bug', 'feature', 'ux', 'general', 'praise', 'question', 'duplicate', 'other'));

-- ============================================
-- 6. UPDATE EMOJI REACTION CONSTRAINT
-- Add '🎉' and '💡' to allowed emojis
-- ============================================

-- Drop existing constraint
ALTER TABLE public.feedback_reactions
DROP CONSTRAINT IF EXISTS feedback_reactions_emoji_check;

-- Add new constraint with all emoji values
ALTER TABLE public.feedback_reactions
ADD CONSTRAINT feedback_reactions_emoji_check
CHECK (emoji IN ('👍', '❤️', '🎉', '🔥', '👀', '💡', '✅'));

-- ============================================
-- 7. UPDATE message_type CONSTRAINT
-- ============================================

-- Drop existing constraint (if named differently)
ALTER TABLE public.feedback_messages
DROP CONSTRAINT IF EXISTS feedback_messages_content_type_check;

ALTER TABLE public.feedback_messages
DROP CONSTRAINT IF EXISTS feedback_messages_message_type_check;

-- Add constraint for message_type
ALTER TABLE public.feedback_messages
ADD CONSTRAINT feedback_messages_message_type_check
CHECK (message_type IN ('text', 'image', 'voice', 'video', 'mixed'));

-- ============================================
-- 8. UPDATE file_type CONSTRAINT
-- ============================================

-- Drop existing constraint
ALTER TABLE public.feedback_attachments
DROP CONSTRAINT IF EXISTS feedback_attachments_attachment_type_check;

ALTER TABLE public.feedback_attachments
DROP CONSTRAINT IF EXISTS feedback_attachments_file_type_check;

-- Add constraint for file_type
ALTER TABLE public.feedback_attachments
ADD CONSTRAINT feedback_attachments_file_type_check
CHECK (file_type IN ('image', 'voice', 'video'));

-- ============================================
-- 9. UPDATE INDEXES FOR RENAMED COLUMNS
-- ============================================

-- Drop old indexes
DROP INDEX IF EXISTS idx_feedback_messages_parent;
DROP INDEX IF EXISTS idx_feedback_messages_status;

-- Create new indexes with correct column names
CREATE INDEX IF NOT EXISTS idx_feedback_messages_parent_id ON feedback_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_status ON feedback_messages(status);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_category ON feedback_messages(category);

-- ============================================
-- 10. UPDATE RLS POLICIES FOR RENAMED COLUMNS
-- ============================================

-- The RLS policies reference is_deleted which still exists, so they should work
-- But let's ensure the policies are correct

-- Drop and recreate message viewing policy to ensure it uses correct columns
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

-- ============================================
-- 11. UPDATE REPLY COUNT TRIGGER FOR parent_id
-- ============================================

-- Update the trigger function to use parent_id instead of parent_message_id
CREATE OR REPLACE FUNCTION public.update_feedback_reply_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
        UPDATE feedback_messages
        SET reply_count = reply_count + 1
        WHERE id = NEW.parent_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
        UPDATE feedback_messages
        SET reply_count = reply_count - 1
        WHERE id = OLD.parent_id;
    END IF;
    RETURN NULL;
END;
$$;

-- ============================================
-- 12. UPDATE is_feedback_admin FUNCTION
-- Create a version that works with auth.uid() directly
-- ============================================

-- Drop old function if exists
DROP FUNCTION IF EXISTS public.is_feedback_admin(UUID);
DROP FUNCTION IF EXISTS public.is_feedback_admin();

-- Create function that uses auth.uid() automatically
CREATE OR REPLACE FUNCTION public.is_feedback_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
$$;

-- Also create version that accepts user_id parameter for flexibility
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

-- ============================================
-- VERIFICATION QUERIES (run these to verify)
-- ============================================
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'feedback_channels' AND column_name = 'is_default';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'feedback_messages';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'feedback_attachments';
-- SELECT * FROM feedback_channels WHERE is_default = true;

-- ============================================
-- ROLLBACK SQL (if needed)
-- ============================================
/*
-- Rollback column renames in feedback_messages
ALTER TABLE public.feedback_messages RENAME COLUMN parent_id TO parent_message_id;
ALTER TABLE public.feedback_messages RENAME COLUMN message_type TO content_type;
ALTER TABLE public.feedback_messages RENAME COLUMN status TO admin_status;
ALTER TABLE public.feedback_messages RENAME COLUMN category TO admin_category;
ALTER TABLE public.feedback_messages RENAME COLUMN priority TO admin_priority;

-- Rollback column renames in feedback_attachments
ALTER TABLE public.feedback_attachments RENAME COLUMN file_url TO storage_path;
ALTER TABLE public.feedback_attachments RENAME COLUMN file_type TO attachment_type;
ALTER TABLE public.feedback_attachments RENAME COLUMN file_size TO file_size_bytes;

-- Drop is_default column
ALTER TABLE public.feedback_channels DROP COLUMN is_default;

-- Rollback status constraint
ALTER TABLE public.feedback_messages DROP CONSTRAINT IF EXISTS feedback_messages_status_check;
ALTER TABLE public.feedback_messages ADD CONSTRAINT feedback_messages_admin_status_check
CHECK (admin_status IN ('open', 'in_progress', 'resolved', 'wont_fix'));

-- Rollback category constraint
ALTER TABLE public.feedback_messages DROP CONSTRAINT IF EXISTS feedback_messages_category_check;
UPDATE public.feedback_messages SET admin_category = 'feature_request' WHERE admin_category = 'feature';
UPDATE public.feedback_messages SET admin_category = 'ux_issue' WHERE admin_category = 'ux';
ALTER TABLE public.feedback_messages ADD CONSTRAINT feedback_messages_admin_category_check
CHECK (admin_category IN ('bug', 'feature_request', 'ux_issue', 'question', 'duplicate', 'other'));

-- Rollback emoji constraint
ALTER TABLE public.feedback_reactions DROP CONSTRAINT IF EXISTS feedback_reactions_emoji_check;
ALTER TABLE public.feedback_reactions ADD CONSTRAINT feedback_reactions_emoji_check
CHECK (emoji IN ('👍', '❤️', '🔥', '👀', '✅'));
*/
