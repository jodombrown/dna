
-- ============================================
-- 1. Add missing foreign key indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON public.comment_reports (comment_id);
CREATE INDEX IF NOT EXISTS idx_feedback_attachments_message_id ON public.feedback_attachments (message_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reactions_user_id ON public.feedback_reactions (user_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_usage_requests_post_id ON public.hashtag_usage_requests (post_id);
CREATE INDEX IF NOT EXISTS idx_hashtags_owner_id ON public.hashtags (owner_id);
CREATE INDEX IF NOT EXISTS idx_hidden_posts_post_id ON public.hidden_posts (post_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_created_by ON public.initiatives (created_by);
CREATE INDEX IF NOT EXISTS idx_nudges_sent_by ON public.nudges (sent_by);
CREATE INDEX IF NOT EXISTS idx_nudges_task_id ON public.nudges (task_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON public.post_reactions (user_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON public.post_reports (post_id);
CREATE INDEX IF NOT EXISTS idx_releases_created_by ON public.releases (created_by);
CREATE INDEX IF NOT EXISTS idx_space_activity_log_user_id ON public.space_activity_log (user_id);
CREATE INDEX IF NOT EXISTS idx_space_members_invited_by ON public.space_members (invited_by);
CREATE INDEX IF NOT EXISTS idx_space_members_role_id ON public.space_members (role_id);
CREATE INDEX IF NOT EXISTS idx_spaces_template_id ON public.spaces (template_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON public.tasks (assigned_by);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON public.tasks (milestone_id);

-- ============================================
-- 2. Drop unused indexes
-- ============================================
DROP INDEX IF EXISTS public.idx_ada_experiment_variants_experiment;
DROP INDEX IF EXISTS public.idx_ada_experiment_variants_policy;
DROP INDEX IF EXISTS public.idx_ada_experiment_assignments_experiment;
DROP INDEX IF EXISTS public.idx_ada_experiment_assignments_variant;
DROP INDEX IF EXISTS public.idx_ada_cohort_memberships_expires;
DROP INDEX IF EXISTS public.idx_ada_cohort_memberships_cohort_id;
DROP INDEX IF EXISTS public.idx_post_comments_flagged_by;
DROP INDEX IF EXISTS public.idx_post_comments_moderated_by;
DROP INDEX IF EXISTS public.idx_project_contributions_project_id;
DROP INDEX IF EXISTS public.idx_regions_continent_id;
DROP INDEX IF EXISTS public.idx_skill_connections_user_b_id;
DROP INDEX IF EXISTS public.idx_spaces_origin_group_id;
DROP INDEX IF EXISTS public.idx_user_roles_granted_by;
DROP INDEX IF EXISTS public.idx_post_comments_parent;
DROP INDEX IF EXISTS public.idx_comment_reactions_user;
DROP INDEX IF EXISTS public.idx_posts_space_id;
DROP INDEX IF EXISTS public.idx_releases_status;
DROP INDEX IF EXISTS public.idx_releases_category;
DROP INDEX IF EXISTS public.idx_release_features_release_id;
DROP INDEX IF EXISTS public.idx_adin_contributor_requests_reviewed_by;
DROP INDEX IF EXISTS public.idx_adin_contributor_requests_user_id;
DROP INDEX IF EXISTS public.idx_feed_research_created_at;
DROP INDEX IF EXISTS public.idx_adin_nudges_user_id;
DROP INDEX IF EXISTS public.idx_adin_recommendations_user_id;
DROP INDEX IF EXISTS public.idx_adin_signals_created_by;
DROP INDEX IF EXISTS public.idx_adin_signals_user_id;
DROP INDEX IF EXISTS public.idx_applications_opportunity_id;
DROP INDEX IF EXISTS public.idx_billing_transactions_organization_id;
DROP INDEX IF EXISTS public.idx_comments_author_id;
DROP INDEX IF EXISTS public.idx_comments_parent_id;
DROP INDEX IF EXISTS public.idx_communities_created_by;
DROP INDEX IF EXISTS public.idx_communities_moderated_by;
DROP INDEX IF EXISTS public.idx_community_events_community_id;
DROP INDEX IF EXISTS public.idx_community_events_created_by;
DROP INDEX IF EXISTS public.idx_community_memberships_approved_by;
DROP INDEX IF EXISTS public.idx_community_memberships_community_id;
DROP INDEX IF EXISTS public.idx_community_posts_author_id;
DROP INDEX IF EXISTS public.idx_community_posts_community_id;
DROP INDEX IF EXISTS public.idx_content_flags_flagged_by;
DROP INDEX IF EXISTS public.idx_content_flags_resolved_by;
DROP INDEX IF EXISTS public.idx_content_moderation_moderator_id;
DROP INDEX IF EXISTS public.idx_contribution_cards_created_by;
DROP INDEX IF EXISTS public.idx_connections_created;
DROP INDEX IF EXISTS public.idx_economic_indicators_province_id;
DROP INDEX IF EXISTS public.idx_economic_indicators_region_id;
DROP INDEX IF EXISTS public.idx_event_blasts_event_id;
