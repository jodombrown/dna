
-- Add the missing index for events.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- Remove indexes that are currently unused and may not be needed
-- Keep only the essential ones that are likely to be used in common queries
DROP INDEX IF EXISTS idx_admin_audit_log_admin_user_id;
DROP INDEX IF EXISTS idx_admin_users_created_by;
DROP INDEX IF EXISTS idx_content_flags_flagged_by;
DROP INDEX IF EXISTS idx_content_flags_resolved_by;
DROP INDEX IF EXISTS idx_contribution_cards_created_by;
DROP INDEX IF EXISTS idx_newsletters_created_by;
DROP INDEX IF EXISTS idx_posts_moderated_by;

-- Keep idx_posts_user_id as it's likely to be used for user post queries
-- Keep idx_events_created_by as it's commonly used for event queries
