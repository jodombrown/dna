
-- Add missing indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user_id ON public.admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_reports_created_by ON public.admin_reports(created_by);
CREATE INDEX IF NOT EXISTS idx_admin_users_created_by ON public.admin_users(created_by);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_communities_moderated_by ON public.communities(moderated_by);
CREATE INDEX IF NOT EXISTS idx_community_flags_flagged_by ON public.community_flags(flagged_by);
CREATE INDEX IF NOT EXISTS idx_community_flags_resolved_by ON public.community_flags(resolved_by);
CREATE INDEX IF NOT EXISTS idx_content_flags_flagged_by ON public.content_flags(flagged_by);
CREATE INDEX IF NOT EXISTS idx_content_flags_resolved_by ON public.content_flags(resolved_by);
CREATE INDEX IF NOT EXISTS idx_contribution_cards_created_by ON public.contribution_cards(created_by);
CREATE INDEX IF NOT EXISTS idx_newsletters_created_by ON public.newsletters(created_by);
CREATE INDEX IF NOT EXISTS idx_posts_moderated_by ON public.posts(moderated_by);

-- Remove unused indexes that are consuming storage and slowing down writes
DROP INDEX IF EXISTS idx_events_created_by;
DROP INDEX IF EXISTS idx_community_flags_status;
DROP INDEX IF EXISTS idx_community_flags_community_id;
DROP INDEX IF EXISTS idx_analytics_events_type;
DROP INDEX IF EXISTS idx_system_metrics_name;
DROP INDEX IF EXISTS idx_system_metrics_recorded_at;
DROP INDEX IF EXISTS idx_posts_user_id;
