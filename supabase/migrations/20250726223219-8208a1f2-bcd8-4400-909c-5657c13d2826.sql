-- Create posts table for social media functionality
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  media_url TEXT,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'article')),
  pillar TEXT DEFAULT 'feed' CHECK (pillar IN ('feed', 'connect', 'collaborate', 'contribute')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'connections')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create post_likes table for likes functionality
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Create post_comments table for comments functionality
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add indexes for better performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_pillar ON public.posts(pillar);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_post_comments_user_id ON public.post_comments(user_id);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts table
CREATE POLICY "Public posts are viewable by everyone" 
ON public.posts 
FOR SELECT 
USING (visibility = 'public' OR user_id = auth.uid());

CREATE POLICY "Users can create their own posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for post_likes table
CREATE POLICY "Likes are viewable for public posts" 
ON public.post_likes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.posts 
  WHERE posts.id = post_likes.post_id 
  AND (posts.visibility = 'public' OR posts.user_id = auth.uid())
));

CREATE POLICY "Users can like posts" 
ON public.post_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes" 
ON public.post_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for post_comments table
CREATE POLICY "Comments are viewable for public posts" 
ON public.post_comments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.posts 
  WHERE posts.id = post_comments.post_id 
  AND (posts.visibility = 'public' OR posts.user_id = auth.uid())
));

CREATE POLICY "Users can comment on posts" 
ON public.post_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.post_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.post_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add impact tracking for social engagement
CREATE OR REPLACE FUNCTION public.track_post_engagement()
RETURNS TRIGGER AS $$
BEGIN
  -- Track post creation
  IF TG_TABLE_NAME = 'posts' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.impact_log (user_id, type, target_type, target_id, pillar, points)
    VALUES (NEW.user_id, 'post', 'post', NEW.id, NEW.pillar, 10);
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
CREATE TRIGGER track_post_creation
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.track_post_engagement();

CREATE TRIGGER track_post_likes
  AFTER INSERT ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.track_post_engagement();

CREATE TRIGGER track_post_comments
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.track_post_engagement();