
-- Add missing indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user_id ON public.admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_created_by ON public.admin_users(created_by);
CREATE INDEX IF NOT EXISTS idx_content_flags_flagged_by ON public.content_flags(flagged_by);
CREATE INDEX IF NOT EXISTS idx_content_flags_resolved_by ON public.content_flags(resolved_by);
CREATE INDEX IF NOT EXISTS idx_contribution_cards_created_by ON public.contribution_cards(created_by);
CREATE INDEX IF NOT EXISTS idx_newsletters_created_by ON public.newsletters(created_by);
CREATE INDEX IF NOT EXISTS idx_posts_moderated_by ON public.posts(moderated_by);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);

-- Remove unused indexes that are consuming storage and slowing down writes
DROP INDEX IF EXISTS idx_content_flags_status;
DROP INDEX IF EXISTS idx_content_flags_content;
DROP INDEX IF EXISTS idx_posts_moderation_status;
DROP INDEX IF EXISTS idx_events_created_by;
DROP INDEX IF EXISTS idx_newsletters_published;
