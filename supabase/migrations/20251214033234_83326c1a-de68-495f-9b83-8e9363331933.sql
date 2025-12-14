-- Add story_type column to posts table for CONVEY enhancement
-- Story Types: impact, update, spotlight, photo_essay

-- Add story_type column with default NULL (only applies to stories)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS story_type TEXT DEFAULT NULL;

-- Add is_featured for future editorial curation
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add gallery_urls for photo essays and multimedia stories
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT NULL;

-- Add index for featured content query performance
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON public.posts(is_featured) WHERE is_featured = TRUE;

-- Add index for story_type filtering
CREATE INDEX IF NOT EXISTS idx_posts_story_type ON public.posts(story_type) WHERE story_type IS NOT NULL;