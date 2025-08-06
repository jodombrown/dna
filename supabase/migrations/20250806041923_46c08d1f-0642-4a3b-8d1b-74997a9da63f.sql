-- Add draft functionality and post management features
-- Add status column to posts table to support drafts
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));

-- Add saved_posts table for bookmarking posts
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS for saved_posts
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_posts
CREATE POLICY "Users can manage their own saved posts"
ON public.saved_posts
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Update posts RLS policies to include draft access
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;

CREATE POLICY "Published posts are viewable by everyone"
ON public.posts
FOR SELECT
USING (status = 'published' AND visibility = 'public');

CREATE POLICY "Users can view their own posts regardless of status"
ON public.posts
FOR SELECT
USING (user_id = auth.uid());

-- Update existing posts insert policy
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;

CREATE POLICY "Users can create their own posts"
ON public.posts
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Update policies for posts
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;

CREATE POLICY "Users can update their own posts"
ON public.posts
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add delete policy for posts
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

CREATE POLICY "Users can delete their own posts"
ON public.posts
FOR DELETE
USING (user_id = auth.uid());