-- Add shared_post_id column to posts table for repost functionality
ALTER TABLE public.posts 
ADD COLUMN shared_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;

-- Add index for better performance when querying shared posts
CREATE INDEX idx_posts_shared_post_id ON public.posts(shared_post_id);

-- Add a check constraint to prevent self-sharing
ALTER TABLE public.posts 
ADD CONSTRAINT posts_no_self_share CHECK (id != shared_post_id);