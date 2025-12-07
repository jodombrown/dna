
-- Remove duplicate constraint on post_likes (keeping post_likes_unique index)
ALTER TABLE public.post_likes DROP CONSTRAINT IF EXISTS unique_post_like;
