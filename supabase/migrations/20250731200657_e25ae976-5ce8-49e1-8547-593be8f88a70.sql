-- Add indexes for unindexed foreign keys to improve query performance
--
-- The adin_signals indexes that originally followed this comment are
-- removed: the table does not exist in the live database, so a
-- from-scratch replay failed on "relation adin_signals does not exist".

-- Index for admin_analytics foreign key
CREATE INDEX IF NOT EXISTS idx_admin_analytics_admin_id ON public.admin_analytics(admin_id);

-- Index for content_moderation foreign key
CREATE INDEX IF NOT EXISTS idx_content_moderation_moderator_id ON public.content_moderation(moderator_id);

-- Index for newsletter_subscriptions foreign key
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_user_id ON public.newsletter_subscriptions(user_id);

-- Index for user_contributions foreign key
CREATE INDEX IF NOT EXISTS idx_user_contributions_user_id ON public.user_contributions(user_id);

-- Index for verified_contributors foreign key
CREATE INDEX IF NOT EXISTS idx_verified_contributors_user_id ON public.verified_contributors(user_id);