-- Fix database performance: add missing foreign key indexes and remove unused indexes

-- Add missing foreign key indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_adin_connection_signals_source_user ON public.adin_connection_signals(source_user);
CREATE INDEX IF NOT EXISTS idx_adin_connection_signals_target_user ON public.adin_connection_signals(target_user);
CREATE INDEX IF NOT EXISTS idx_adin_contributor_requests_reviewed_by ON public.adin_contributor_requests(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin_id ON public.admin_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_created_by ON public.admin_users(created_by);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON public.campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_communities_moderated_by ON public.communities(moderated_by);
CREATE INDEX IF NOT EXISTS idx_contact_requests_receiver_id ON public.contact_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_2_id ON public.conversations(user_2_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_growth_campaigns_created_by ON public.growth_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_impact_log_user_id ON public.impact_log(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_created_by ON public.invites(created_by);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_user_id ON public.leaderboard_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_by ON public.platform_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referrer_id ON public.profiles(referrer_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_communities_owner_id ON public.user_communities(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);

-- Remove unused indexes to improve write performance and reduce storage
DROP INDEX IF EXISTS idx_contributor_requests_user_id;
DROP INDEX IF EXISTS idx_contributor_requests_status;
DROP INDEX IF EXISTS idx_contributor_requests_created_at;
DROP INDEX IF EXISTS idx_adin_profile_verified_contributor;
DROP INDEX IF EXISTS idx_user_dna_points_total_score;
DROP INDEX IF EXISTS idx_user_dna_points_pillars;
DROP INDEX IF EXISTS idx_user_badges_user_id;
DROP INDEX IF EXISTS idx_leaderboard_cache_type_score;
DROP INDEX IF EXISTS idx_campaign_analytics_user_id;
DROP INDEX IF EXISTS idx_integration_tokens_created_by;