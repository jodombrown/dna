
-- Create posts table for social feed
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'article', 'event_share', 'community_share', 'contribution_card', 'newsletter')),
  media_urls TEXT[],
  article_title TEXT,
  article_summary TEXT,
  shared_event_id UUID REFERENCES public.events(id),
  shared_community_id UUID REFERENCES public.communities(id),
  hashtags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create post_reactions table (for likes, celebrates, etc.)
CREATE TABLE public.post_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'celebrate', 'support', 'insightful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Create post_comments table
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.post_comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create post_shares table
CREATE TABLE public.post_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  shared_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create contribution_cards table
CREATE TABLE public.contribution_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('funding', 'skills', 'time', 'network', 'advocacy', 'mentorship', 'resources')),
  impact_area TEXT,
  location TEXT,
  amount_needed DECIMAL,
  amount_raised DECIMAL DEFAULT 0,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create newsletters table
CREATE TABLE public.newsletters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  featured_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  publication_date TIMESTAMP WITH TIME ZONE,
  category TEXT,
  tags TEXT[],
  subscriber_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create newsletter_subscriptions table
CREATE TABLE public.newsletter_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  newsletter_id UUID REFERENCES public.newsletters(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(newsletter_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
CREATE POLICY "Users can view published posts" ON public.posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can insert their own posts" ON public.posts
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE USING ((select auth.uid()) = user_id);

-- RLS Policies for post_reactions
CREATE POLICY "Users can view all reactions" ON public.post_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can react to posts" ON public.post_reactions
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can remove their own reactions" ON public.post_reactions
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

-- RLS Policies for post_shares
CREATE POLICY "Users can view all shares" ON public.post_shares
  FOR SELECT USING (true);

CREATE POLICY "Users can share posts" ON public.post_shares
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own shares" ON public.post_shares
  FOR DELETE USING ((select auth.uid()) = user_id);

-- RLS Policies for contribution_cards
CREATE POLICY "Users can view active contribution cards" ON public.contribution_cards
  FOR SELECT USING (status = 'active' OR (select auth.uid()) = created_by);

CREATE POLICY "Users can create contribution cards" ON public.contribution_cards
  FOR INSERT WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Users can update their own contribution cards" ON public.contribution_cards
  FOR UPDATE USING ((select auth.uid()) = created_by);

CREATE POLICY "Users can delete their own contribution cards" ON public.contribution_cards
  FOR DELETE USING ((select auth.uid()) = created_by);

-- RLS Policies for newsletters
CREATE POLICY "Users can view published newsletters" ON public.newsletters
  FOR SELECT USING (is_published = true OR (select auth.uid()) = created_by);

CREATE POLICY "Users can create newsletters" ON public.newsletters
  FOR INSERT WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Users can update their own newsletters" ON public.newsletters
  FOR UPDATE USING ((select auth.uid()) = created_by);

CREATE POLICY "Users can delete their own newsletters" ON public.newsletters
  FOR DELETE USING ((select auth.uid()) = created_by);

-- RLS Policies for newsletter_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.newsletter_subscriptions
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can subscribe to newsletters" ON public.newsletter_subscriptions
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can unsubscribe from newsletters" ON public.newsletter_subscriptions
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Create indexes for performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_hashtags ON public.posts USING GIN(hashtags);
CREATE INDEX idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_contribution_cards_status ON public.contribution_cards(status);
CREATE INDEX idx_newsletters_published ON public.newsletters(is_published, publication_date DESC);

-- Functions to update counts
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'post_reactions' THEN
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
  ELSIF TG_TABLE_NAME = 'post_shares' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.posts SET shares_count = shares_count - 1 WHERE id = OLD.post_id;
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
  AFTER INSERT OR DELETE ON public.post_reactions
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();

CREATE TRIGGER update_comments_count
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();

CREATE TRIGGER update_shares_count
  AFTER INSERT OR DELETE ON public.post_shares
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();
