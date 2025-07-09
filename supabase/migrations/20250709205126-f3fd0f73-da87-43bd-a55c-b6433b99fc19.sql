-- Optimize database performance by fixing unindexed foreign keys and removing unused indexes

-- Add missing indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_adin_contributor_requests_user_id ON public.adin_contributor_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_user_id ON public.campaign_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_created_by ON public.integration_tokens(created_by);

-- Remove unused indexes to improve write performance and reduce storage
DROP INDEX IF EXISTS idx_adin_connection_signals_source_user;
DROP INDEX IF EXISTS idx_adin_connection_signals_target_user;
DROP INDEX IF EXISTS idx_adin_contributor_requests_reviewed_by;
DROP INDEX IF EXISTS idx_admin_logs_admin_id;
DROP INDEX IF EXISTS idx_admin_notifications_admin_id;
DROP INDEX IF EXISTS idx_admin_users_created_by;
DROP INDEX IF EXISTS idx_campaign_analytics_campaign_id;
DROP INDEX IF EXISTS idx_communities_moderated_by;
DROP INDEX IF EXISTS idx_conversations_user_2_id;
DROP INDEX IF EXISTS idx_events_created_by;
DROP INDEX IF EXISTS idx_growth_campaigns_created_by;
DROP INDEX IF EXISTS idx_impact_log_user_id;
DROP INDEX IF EXISTS idx_invites_created_by;
DROP INDEX IF EXISTS idx_leaderboard_cache_user_id;
DROP INDEX IF EXISTS idx_platform_settings_updated_by;
DROP INDEX IF EXISTS idx_profiles_referrer_id;
DROP INDEX IF EXISTS idx_user_communities_owner_id;
DROP INDEX IF EXISTS idx_user_feedback_user_id;

-- KEEP these indexes as they ARE actively used in current app:
-- - idx_posts_author_id: Used for fetching user's own posts and RLS policies
-- - idx_comments_author_id: Used for RLS policies and user's own comments  
-- - idx_comments_parent_id: Used for threaded reply functionality
-- - idx_reactions_user_id: Used for checking if user already reacted to a post
-- - idx_messages_conversation_id: Used for fetching messages in conversations
-- - idx_messages_sender_id: Used for message queries and RLS
-- - idx_notifications_user_id: Used for fetching user notifications
-- - idx_contact_requests_receiver_id: Used for contact request queries

-- Note: Some indexes show as "unused" because the app is in development
-- but they are essential for current feed, messaging, and user interaction functionality