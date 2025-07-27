-- Add unique constraint to post_reactions to prevent duplicate reactions
-- This ensures one reaction per user per emoji per post
ALTER TABLE public.post_reactions 
ADD CONSTRAINT unique_user_emoji_post 
UNIQUE (post_id, user_id, emoji);

-- Create post_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for post_comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for post_comments
CREATE POLICY "Post comments are viewable by everyone" 
ON public.post_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_comments.post_id
  )
);

CREATE POLICY "Users can create their own comments" 
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

-- Create trigger for updated_at
CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Track comment engagement in impact_log
CREATE OR REPLACE FUNCTION public.track_comment_engagement()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.impact_log (user_id, type, target_type, target_id, pillar, points)
    VALUES (NEW.user_id, 'comment', 'post', NEW.post_id, 'connect', 3);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_comment_engagement_trigger
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.track_comment_engagement();