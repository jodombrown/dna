
-- Create posts table for social feed
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'article', 'event_share', 'community_share')),
  media_urls TEXT[],
  article_title TEXT,
  article_summary TEXT,
  shared_event_id UUID REFERENCES public.events(id),
  shared_community_id UUID REFERENCES public.communities(id),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create post_likes table
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create follow relationships table
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users NOT NULL,
  following_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS on all tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
CREATE POLICY "Users can view published posts" ON public.posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can insert their own posts" ON public.posts
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE USING ((select auth.uid()) = user_id);

-- RLS Policies for post_likes
CREATE POLICY "Users can view all likes" ON public.post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON public.post_likes
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can unlike their own likes" ON public.post_likes
  FOR DELETE USING ((select auth.uid()) = user_id);

-- RLS Policies for post_comments
CREATE POLICY "Users can view all comments" ON public.post_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.post_comments
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own comments" ON public.post_comments
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own comments" ON public.post_comments
  FOR DELETE USING ((select auth.uid()) = user_id);

-- RLS Policies for user_follows
CREATE POLICY "Users can view all follows" ON public.user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.user_follows
  FOR INSERT WITH CHECK ((select auth.uid()) = follower_id);

CREATE POLICY "Users can unfollow" ON public.user_follows
  FOR DELETE USING ((select auth.uid()) = follower_id);

-- Create indexes for performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);

-- Function to update post counts
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'post_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'post_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update post counts
CREATE TRIGGER update_likes_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();

CREATE TRIGGER update_comments_count
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();
