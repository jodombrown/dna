
-- Add title column to posts table for story titles
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.posts.title IS 'Optional title field, used primarily for story and article posts';

-- Update post_type check constraint to include 'story'
-- First, drop the existing constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_schema = 'public' 
      AND constraint_name LIKE '%posts_post_type%'
  ) THEN
    ALTER TABLE public.posts DROP CONSTRAINT posts_post_type_check;
  END IF;
END $$;

-- Add new constraint that includes story
ALTER TABLE public.posts
ADD CONSTRAINT posts_post_type_check 
CHECK (post_type IN ('post', 'status', 'story', 'event', 'space', 'need', 'reshare', 'community_post'));
