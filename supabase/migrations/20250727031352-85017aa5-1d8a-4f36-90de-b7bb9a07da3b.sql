-- Add remaining missing foreign key indexes for optimal query performance

-- Campaign analytics foreign key index
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON public.campaign_analytics(campaign_id);

-- Comments foreign key indexes
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

-- Communities foreign key index
CREATE INDEX IF NOT EXISTS idx_communities_moderated_by ON public.communities(moderated_by);

-- Events foreign key index
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- Impact log foreign key index
CREATE INDEX IF NOT EXISTS idx_impact_log_user_id ON public.impact_log(user_id);

-- Messages foreign key index
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);

-- Platform settings foreign key index
CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_by ON public.platform_settings(updated_by);

-- Post comments foreign key indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);

-- Post likes foreign key index
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);

-- Posts foreign key indexes
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);

-- Profiles foreign key index
CREATE INDEX IF NOT EXISTS idx_profiles_referrer_id ON public.profiles(referrer_id);

-- Reactions foreign key index
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);

-- Saved searches foreign key index
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);

-- Search analytics foreign key index
CREATE INDEX IF NOT EXISTS idx_search_analytics_user_id ON public.search_analytics(user_id);