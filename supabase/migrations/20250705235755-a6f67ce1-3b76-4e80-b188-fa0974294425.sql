-- Fix database performance issues: add missing foreign key index and remove unused indexes

-- 1. Add missing index for communities.moderated_by foreign key
CREATE INDEX IF NOT EXISTS idx_communities_moderated_by ON public.communities(moderated_by);

-- 2. Remove unused indexes that are not needed for current application functionality
-- Keep indexes that are likely to be used by the current app features

-- Remove unused users table indexes (these fields aren't currently queried)
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_origin_country;
DROP INDEX IF EXISTS idx_users_diaspora_tags;
DROP INDEX IF EXISTS idx_users_causes;

-- Remove unused user_communities indexes (this table isn't actively used yet)
DROP INDEX IF EXISTS idx_user_communities_owner_id;
DROP INDEX IF EXISTS idx_user_communities_name;
DROP INDEX IF EXISTS idx_user_communities_location;
DROP INDEX IF EXISTS idx_user_communities_tags;
DROP INDEX IF EXISTS idx_user_communities_created_at;

-- Keep posts indexes as they ARE actually needed for the feed functionality:
-- - idx_posts_created_at: used for ordering posts by date
-- - idx_posts_pillar: used for filtering posts by pillar
-- - idx_posts_author_id: used for user's own posts
-- - idx_posts_visibility: used in RLS policies
-- These will be used as the app scales, so keeping them

-- Keep reactions indexes as they ARE needed for the reactions feature:
-- - idx_reactions_post_id: used for fetching reactions per post
-- - idx_reactions_user_id: used for checking user's existing reactions
-- These are actively used in the current implementation

-- Keep comments indexes as they ARE needed for the comments feature:
-- - idx_comments_post_id: used for fetching comments per post
-- - idx_comments_author_id: used for user's own comments
-- - idx_comments_parent_id: used for threaded replies
-- These are actively used in the current implementation

-- Remove unused events indexes (events aren't actively used in current app)
DROP INDEX IF EXISTS idx_events_created_by;

-- Note: Some indexes marked as "unused" are actually needed for current app functionality
-- The linter may show them as unused if the database hasn't been queried enough yet
-- or if the query planner is using alternative execution paths