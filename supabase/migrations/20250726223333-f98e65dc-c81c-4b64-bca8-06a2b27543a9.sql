-- Add missing columns to existing posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'article'));

-- Add user_id column as alias to author_id for consistency (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') THEN
    ALTER TABLE public.posts ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    -- Copy author_id to user_id for existing records
    UPDATE public.posts SET user_id = author_id WHERE user_id IS NULL;
    -- Make user_id NOT NULL
    ALTER TABLE public.posts ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Create post_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Create post_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add indexes for better performance (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_user_id_new') THEN
    CREATE INDEX idx_posts_user_id_new ON public.posts(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_type') THEN
    CREATE INDEX idx_posts_type ON public.posts(type);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_post_likes_post_id') THEN
    CREATE INDEX idx_post_likes_post_id ON public.post_likes(post_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_post_likes_user_id') THEN
    CREATE INDEX idx_post_likes_user_id ON public.post_likes(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_post_comments_post_id') THEN
    CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_post_comments_user_id') THEN
    CREATE INDEX idx_post_comments_user_id ON public.post_comments(user_id);
  END IF;
END $$;

-- Enable Row Level Security on new tables
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_likes table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'Likes are viewable for public posts') THEN
    CREATE POLICY "Likes are viewable for public posts" 
    ON public.post_likes 
    FOR SELECT 
    USING (EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_likes.post_id 
      AND (posts.visibility = 'public' OR posts.author_id = auth.uid() OR posts.user_id = auth.uid())
    ));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'Users can like posts') THEN
    CREATE POLICY "Users can like posts" 
    ON public.post_likes 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'Users can remove their own likes') THEN
    CREATE POLICY "Users can remove their own likes" 
    ON public.post_likes 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for post_comments table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Comments are viewable for public posts') THEN
    CREATE POLICY "Comments are viewable for public posts" 
    ON public.post_comments 
    FOR SELECT 
    USING (EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_comments.post_id 
      AND (posts.visibility = 'public' OR posts.author_id = auth.uid() OR posts.user_id = auth.uid())
    ));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Users can comment on posts') THEN
    CREATE POLICY "Users can comment on posts" 
    ON public.post_comments 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Users can update their own comments') THEN
    CREATE POLICY "Users can update their own comments" 
    ON public.post_comments 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Users can delete their own comments') THEN
    CREATE POLICY "Users can delete their own comments" 
    ON public.post_comments 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add trigger for post_comments updated_at
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_post_comments_updated_at') THEN
    CREATE TRIGGER update_post_comments_updated_at
      BEFORE UPDATE ON public.post_comments
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Add impact tracking for social engagement
CREATE OR REPLACE FUNCTION public.track_post_engagement()
RETURNS TRIGGER AS $$
BEGIN
  -- Track post creation
  IF TG_TABLE_NAME = 'posts' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.impact_log (user_id, type, target_type, target_id, pillar, points)
    VALUES (COALESCE(NEW.user_id, NEW.author_id), 'post', 'post', NEW.id, NEW.pillar, 10);
    RETURN NEW;
  END IF;
  
  -- Track likes
  IF TG_TABLE_NAME = 'post_likes' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.impact_log (user_id, type, target_type, target_id, pillar, points)
    VALUES (NEW.user_id, 'reaction', 'post', NEW.post_id, 'connect', 1);
    RETURN NEW;
  END IF;
  
  -- Track comments
  IF TG_TABLE_NAME = 'post_comments' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.impact_log (user_id, type, target_type, target_id, pillar, points)
    VALUES (NEW.user_id, 'comment', 'post', NEW.post_id, 'connect', 3);
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add engagement tracking triggers
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'track_post_creation_social') THEN
    CREATE TRIGGER track_post_creation_social
      AFTER INSERT ON public.posts
      FOR EACH ROW
      EXECUTE FUNCTION public.track_post_engagement();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'track_post_likes') THEN
    CREATE TRIGGER track_post_likes
      AFTER INSERT ON public.post_likes
      FOR EACH ROW
      EXECUTE FUNCTION public.track_post_engagement();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'track_post_comments') THEN
    CREATE TRIGGER track_post_comments
      AFTER INSERT ON public.post_comments
      FOR EACH ROW
      EXECUTE FUNCTION public.track_post_engagement();
  END IF;
END $$;