
-- Remove remaining social feed tables that weren't cleaned up properly
DROP TABLE IF EXISTS public.post_likes CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP VIEW IF EXISTS public.get_posts_with_profiles CASCADE;

-- Also clean up any remaining post-related functions
DROP FUNCTION IF EXISTS public.update_post_counts() CASCADE;
