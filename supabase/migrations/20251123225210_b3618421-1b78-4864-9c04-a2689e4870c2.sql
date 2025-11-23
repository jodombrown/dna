-- DNA | FEED Fix Pack v1.1 – Post & Like Reliability
-- Add unique constraint to prevent duplicate likes and ensure data integrity

-- Add unique constraint on post_likes to prevent duplicate likes
ALTER TABLE public.post_likes
  DROP CONSTRAINT IF EXISTS post_likes_unique;

ALTER TABLE public.post_likes
  ADD CONSTRAINT post_likes_unique UNIQUE (post_id, user_id);

-- Ensure RLS is enabled
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;