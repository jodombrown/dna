-- Fix database performance issues by adding missing foreign key indexes and removing unused ones

-- Add missing indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_admin_users_created_by ON public.admin_users(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_user_2_id ON public.conversations(user_2_id);
CREATE INDEX IF NOT EXISTS idx_invites_created_by ON public.invites(created_by);
CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_by ON public.platform_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_profiles_referrer_id ON public.profiles(referrer_id);

-- Remove unused indexes that are consuming storage and slowing down writes
-- Admin tables - keeping essential ones, removing unused
DROP INDEX IF EXISTS idx_admin_users_user_id;
DROP INDEX IF EXISTS idx_admin_users_role;
DROP INDEX IF EXISTS idx_admin_users_active;
DROP INDEX IF EXISTS idx_admin_logs_admin_id;
DROP INDEX IF EXISTS idx_admin_logs_created_at;
DROP INDEX IF EXISTS idx_admin_logs_resource;
DROP INDEX IF EXISTS idx_admin_notifications_admin_id;
DROP INDEX IF EXISTS idx_admin_notifications_unread;

-- User content tables - removing unused indexes
DROP INDEX IF EXISTS idx_posts_author_id;
DROP INDEX IF EXISTS idx_comments_author_id;
DROP INDEX IF EXISTS idx_comments_parent_id;
DROP INDEX IF EXISTS idx_reactions_user_id;

-- Feedback and impact tables - removing unused indexes
DROP INDEX IF EXISTS idx_user_feedback_user_id;
DROP INDEX IF EXISTS idx_user_feedback_type;
DROP INDEX IF EXISTS idx_user_feedback_status;
DROP INDEX IF EXISTS idx_user_feedback_created_at;
DROP INDEX IF EXISTS idx_impact_log_user_id;
DROP INDEX IF EXISTS idx_impact_log_type;
DROP INDEX IF EXISTS idx_impact_log_pillar;
DROP INDEX IF EXISTS idx_impact_log_created_at;

-- Communication tables - removing unused indexes
DROP INDEX IF EXISTS idx_conversations_users;
DROP INDEX IF EXISTS idx_conversations_last_message;
DROP INDEX IF EXISTS idx_messages_conversation;
DROP INDEX IF EXISTS idx_messages_sender;
DROP INDEX IF EXISTS idx_contact_requests_receiver;
DROP INDEX IF EXISTS idx_contact_requests_sender;

-- Other unused indexes
DROP INDEX IF EXISTS idx_events_created_by;
DROP INDEX IF EXISTS idx_user_communities_owner_id;
DROP INDEX IF EXISTS idx_communities_moderated_by;
DROP INDEX IF EXISTS idx_referrals_email;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_unread;