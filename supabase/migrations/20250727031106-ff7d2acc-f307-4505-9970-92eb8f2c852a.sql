-- Fix database performance issues identified by Supabase linter
-- This migration adds missing foreign key indexes and removes unused indexes

-- 1. Add missing indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_beta_applications_reviewed_by ON public.beta_applications(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_user_id ON public.beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_community_event_attendees_user_id ON public.community_event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_community_events_created_by ON public.community_events(created_by);
CREATE INDEX IF NOT EXISTS idx_community_memberships_approved_by ON public.community_memberships(approved_by);

-- 2. Remove unused indexes to reduce storage overhead and improve write performance
-- Comments table unused indexes
DROP INDEX IF EXISTS public.idx_comments_author_id;
DROP INDEX IF EXISTS public.idx_comments_parent_id;
DROP INDEX IF EXISTS public.idx_comments_post_created;
DROP INDEX IF EXISTS public.idx_comments_created_at;

-- Messages table unused indexes
DROP INDEX IF EXISTS public.idx_messages_conversation_id;
DROP INDEX IF EXISTS public.idx_messages_conversation_created;

-- Posts table unused indexes
DROP INDEX IF EXISTS public.idx_posts_author_id;
DROP INDEX IF EXISTS public.idx_posts_user_id_new;
DROP INDEX IF EXISTS public.idx_posts_type;
DROP INDEX IF EXISTS public.idx_posts_visibility;
DROP INDEX IF EXISTS public.idx_posts_author_created;

-- Reactions table unused indexes
DROP INDEX IF EXISTS public.idx_reactions_user_id;

-- Post engagement unused indexes
DROP INDEX IF EXISTS public.idx_post_likes_post_id;
DROP INDEX IF EXISTS public.idx_post_likes_user_id;
DROP INDEX IF EXISTS public.idx_post_comments_post_id;
DROP INDEX IF EXISTS public.idx_post_comments_user_id;
DROP INDEX IF EXISTS public.idx_post_reactions_post_id;
DROP INDEX IF EXISTS public.idx_post_reactions_user_id;

-- Campaign analytics unused indexes
DROP INDEX IF EXISTS public.idx_campaign_analytics_campaign_id;

-- Communities unused indexes
DROP INDEX IF EXISTS public.idx_communities_moderated_by;
DROP INDEX IF EXISTS public.idx_communities_created_at;
DROP INDEX IF EXISTS public.idx_communities_category;
DROP INDEX IF EXISTS public.idx_communities_active_featured;

-- Community events unused indexes
DROP INDEX IF EXISTS public.idx_community_events_event_date;
DROP INDEX IF EXISTS public.idx_community_event_attendees_event_id;

-- Community memberships unused indexes
DROP INDEX IF EXISTS public.idx_community_memberships_status;
DROP INDEX IF EXISTS public.idx_community_memberships_community_status;

-- Events unused indexes
DROP INDEX IF EXISTS public.idx_events_created_by;
DROP INDEX IF EXISTS public.idx_events_created_at;
DROP INDEX IF EXISTS public.idx_events_featured;

-- Impact log unused indexes
DROP INDEX IF EXISTS public.idx_impact_log_user_id;
DROP INDEX IF EXISTS public.idx_impact_log_user_created;
DROP INDEX IF EXISTS public.idx_impact_log_pillar;

-- Platform settings unused indexes
DROP INDEX IF EXISTS public.idx_platform_settings_updated_by;

-- Profiles unused indexes
DROP INDEX IF EXISTS public.idx_profiles_referrer_id;
DROP INDEX IF EXISTS public.idx_profiles_email;
DROP INDEX IF EXISTS public.idx_profiles_username;
DROP INDEX IF EXISTS public.idx_profiles_public;
DROP INDEX IF EXISTS public.idx_profiles_location;

-- Search analytics unused indexes
DROP INDEX IF EXISTS public.idx_search_analytics_user_id;
DROP INDEX IF EXISTS public.idx_search_analytics_created_at;

-- Saved searches unused indexes
DROP INDEX IF EXISTS public.idx_saved_searches_user_id;

-- Error logs unused indexes
DROP INDEX IF EXISTS public.idx_error_logs_created_at;
DROP INDEX IF EXISTS public.idx_error_logs_severity;
DROP INDEX IF EXISTS public.idx_error_logs_error_type;

-- Notifications unused indexes
DROP INDEX IF EXISTS public.idx_notifications_created_at;

-- User DNA points unused indexes
DROP INDEX IF EXISTS public.idx_user_dna_points_total_score;
DROP INDEX IF EXISTS public.idx_user_dna_points_last_updated;