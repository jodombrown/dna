-- Add missing foreign key indexes for optimal query performance

-- Add missing indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_adin_connection_signals_source_user ON public.adin_connection_signals(source_user);
CREATE INDEX IF NOT EXISTS idx_adin_connection_signals_target_user ON public.adin_connection_signals(target_user);
CREATE INDEX IF NOT EXISTS idx_adin_contributor_requests_reviewed_by ON public.adin_contributor_requests(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin_id ON public.admin_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_created_by ON public.admin_users(created_by);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON public.campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_communities_moderated_by ON public.communities(moderated_by);
CREATE INDEX IF NOT EXISTS idx_conversations_user_2_id ON public.conversations(user_2_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_growth_campaigns_created_by ON public.growth_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_impact_log_user_id ON public.impact_log(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_created_by ON public.invites(created_by);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_user_id ON public.leaderboard_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_by ON public.platform_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_profiles_referrer_id ON public.profiles(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_communities_owner_id ON public.user_communities(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);

-- Note: All indexes flagged as "unused" by the linter are kept because they are essential for:
-- - RLS policy enforcement (posts_author_id, comments_author_id, reactions_user_id, etc.)
-- - Current app functionality (messages, notifications, contact_requests, etc.)
-- - Foreign key constraint performance
-- 
-- These appear "unused" only because the app is in development with limited database activity.
-- They will be actively used as the application scales and user activity increases.