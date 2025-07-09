-- Optimize database performance by fixing unindexed foreign keys and removing unused indexes

-- Add missing indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_user_id ON public.campaign_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_created_by ON public.integration_tokens(created_by);

-- Remove unused indexes to improve write performance and reduce storage
DROP INDEX IF EXISTS idx_invites_created_by;
DROP INDEX IF EXISTS idx_platform_settings_updated_by;
DROP INDEX IF EXISTS idx_profiles_referrer_id;
DROP INDEX IF EXISTS idx_admin_users_created_by;
DROP INDEX IF EXISTS idx_conversations_user_2_id;

-- Remove unused ADIN-related indexes
DROP INDEX IF EXISTS idx_user_adin_profile_user_id;
DROP INDEX IF EXISTS idx_user_adin_profile_last_active;
DROP INDEX IF EXISTS idx_user_adin_profile_engagement_pillars;
DROP INDEX IF EXISTS idx_user_adin_profile_interests;
DROP INDEX IF EXISTS idx_user_adin_profile_skills;
DROP INDEX IF EXISTS idx_adin_connection_signals_source_user;
DROP INDEX IF EXISTS idx_adin_connection_signals_target_user;
DROP INDEX IF EXISTS idx_adin_connection_signals_score;
DROP INDEX IF EXISTS idx_adin_connection_signals_timestamp;
DROP INDEX IF EXISTS idx_adin_connection_signals_reason;

-- Remove unused admin and system indexes
DROP INDEX IF EXISTS idx_admin_logs_admin_id;
DROP INDEX IF EXISTS idx_admin_notifications_admin_id;

-- Remove unused content-related indexes  
DROP INDEX IF EXISTS idx_posts_author_id;
DROP INDEX IF EXISTS idx_comments_author_id;
DROP INDEX IF EXISTS idx_comments_parent_id;
DROP INDEX IF EXISTS idx_reactions_user_id;

-- Remove unused messaging indexes
DROP INDEX IF EXISTS idx_messages_conversation_id;
DROP INDEX IF EXISTS idx_messages_sender_id;
DROP INDEX IF EXISTS idx_contact_requests_receiver_id;

-- Remove unused community and event indexes
DROP INDEX IF EXISTS idx_events_created_by;
DROP INDEX IF EXISTS idx_communities_moderated_by;
DROP INDEX IF EXISTS idx_user_communities_owner_id;

-- Remove unused tracking indexes
DROP INDEX IF EXISTS idx_impact_log_user_id;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_user_feedback_user_id;

-- Remove unused campaign indexes
DROP INDEX IF EXISTS idx_growth_campaigns_status;
DROP INDEX IF EXISTS idx_growth_campaigns_created_by;
DROP INDEX IF EXISTS idx_campaign_analytics_campaign_id;
DROP INDEX IF EXISTS idx_campaign_analytics_event_type;
DROP INDEX IF EXISTS idx_integration_tokens_service;