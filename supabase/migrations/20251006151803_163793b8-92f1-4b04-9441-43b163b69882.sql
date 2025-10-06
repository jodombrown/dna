-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.post_likes CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;

-- Create posts table for activity feed
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'status',
  visibility TEXT NOT NULL DEFAULT 'public',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_likes table
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_post_like UNIQUE (post_id, user_id)
);

-- Create indexes
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_visibility ON public.posts(visibility);
CREATE INDEX idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX idx_post_likes_user ON public.post_likes(user_id);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
CREATE POLICY "Public posts viewable by everyone"
  ON public.posts FOR SELECT
  USING (
    visibility = 'public' 
    OR (visibility = 'connections' AND EXISTS (
      SELECT 1 FROM public.connections c
      WHERE ((c.a = auth.uid() AND c.b = posts.author_id)
         OR (c.b = auth.uid() AND c.a = posts.author_id))
        AND c.status = 'active'
    ))
    OR author_id = auth.uid()
  );

CREATE POLICY "Users create own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = author_id);

-- RLS Policies for post_likes
CREATE POLICY "Post likes viewable if post viewable"
  ON public.post_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_likes.post_id
      AND (
        p.visibility = 'public'
        OR (p.visibility = 'connections' AND EXISTS (
          SELECT 1 FROM public.connections c
          WHERE ((c.a = auth.uid() AND c.b = p.author_id)
             OR (c.b = auth.uid() AND c.a = p.author_id))
            AND c.status = 'active'
        ))
        OR p.author_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users like posts"
  ON public.post_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_likes.post_id
      AND (
        p.visibility = 'public'
        OR (p.visibility = 'connections' AND EXISTS (
          SELECT 1 FROM public.connections c
          WHERE ((c.a = auth.uid() AND c.b = p.author_id)
             OR (c.b = auth.uid() AND c.a = p.author_id))
            AND c.status = 'active'
        ))
        OR p.author_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users unlike posts"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update post timestamp
CREATE OR REPLACE FUNCTION public.update_post_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_timestamp();