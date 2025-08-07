-- DNA V1 Schema Cleanup - Remove Unused and Legacy Tables
-- Phase 1: Remove tables with zero data and no dependencies

-- Remove unused static/config tables
DROP TABLE IF EXISTS public.embed_providers;
DROP TABLE IF EXISTS public.launch_config;
DROP TABLE IF EXISTS public.phase_metrics;
DROP TABLE IF EXISTS public.platform_settings;
DROP TABLE IF EXISTS public.search_analytics;
DROP TABLE IF EXISTS public.leaderboard_cache;
DROP TABLE IF EXISTS public.newsletter_subscriptions;
DROP TABLE IF EXISTS public.saved_searches;

-- Remove legacy beta and onboarding tables
DROP TABLE IF EXISTS public.onboarding_feedback;
DROP TABLE IF EXISTS public.beta_applications;
DROP TABLE IF EXISTS public.beta_feedback;
DROP TABLE IF EXISTS public.integration_tokens;
DROP TABLE IF EXISTS public.reminder_logs;

-- Remove unused engagement/automation tables
DROP TABLE IF EXISTS public.growth_campaigns;
DROP TABLE IF EXISTS public.campaign_analytics;
DROP TABLE IF EXISTS public.form_submissions;

-- Phase 2: Consolidate redundant tables
-- Keep user_adin_profile, remove adin_profiles (both empty, user_adin_profile has better structure)
DROP TABLE IF EXISTS public.adin_profiles;

-- Keep user_contributions, remove contributions (both empty, user_contributions has better structure)
DROP TABLE IF EXISTS public.contributions;

-- Keep comments, remove post_comments (comments is more generic and actively used)
DROP TABLE IF EXISTS public.post_comments;

-- Keep post_reactions, remove reactions (post_reactions is more specific)
DROP TABLE IF EXISTS public.reactions;

-- Remove duplicate/unused analytics tables
DROP TABLE IF EXISTS public.admin_analytics;

-- Remove unused referral system (if not actively used)
DROP TABLE IF EXISTS public.referrals;

-- Remove profile views tracking (privacy concern and not used in UI)
DROP TABLE IF EXISTS public.profile_views;