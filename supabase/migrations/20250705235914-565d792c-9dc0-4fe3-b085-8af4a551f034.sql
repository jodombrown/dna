-- Add missing foreign key indexes and clean up truly unused indexes

-- 1. Add missing foreign key indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_user_communities_owner_id ON public.user_communities(owner_id);

-- 2. Remove only the truly unused indexes that aren't needed for current app functionality

-- Remove hashtags and visibility indexes as these features aren't actively used yet
DROP INDEX IF EXISTS idx_posts_hashtags;
DROP INDEX IF EXISTS idx_posts_visibility;

-- Remove reaction type and created_at indexes as these aren't queried in current implementation
DROP INDEX IF EXISTS idx_reactions_type;
DROP INDEX IF EXISTS idx_reactions_created_at;

-- Remove comments created_at index as comments are ordered by created_at in application code, not DB
DROP INDEX IF EXISTS idx_comments_created_at;

-- Remove communities moderated_by index as moderation features aren't implemented yet
DROP INDEX IF EXISTS idx_communities_moderated_by;

-- KEEP these indexes as they ARE actively used in current app:
-- - idx_posts_created_at: Used for ORDER BY created_at DESC in feed queries
-- - idx_posts_pillar: Used for filtering posts by pillar (Connect/Collaborate/Contribute)
-- - idx_posts_author_id: Used for fetching user's own posts and RLS policies
-- - idx_reactions_post_id: Used for fetching all reactions for a specific post
-- - idx_reactions_user_id: Used for checking if user already reacted to a post
-- - idx_comments_post_id: Used for fetching all comments for a specific post
-- - idx_comments_author_id: Used for RLS policies and user's own comments
-- - idx_comments_parent_id: Used for threaded reply functionality

-- Note: The linter shows these as "unused" because the app is in development
-- but they are essential for current feed, reactions, and comments functionality