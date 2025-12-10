-- Add parent_comment_id to post_comments for threaded replies (unlimited depth)
ALTER TABLE public.post_comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE;

-- Create index for faster nested comment queries
CREATE INDEX IF NOT EXISTS idx_post_comments_parent ON public.post_comments(parent_comment_id);

-- Create comment_reactions table for emoji reactions on comments
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id, emoji)
);

-- Create indexes for comment reactions
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON public.comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user ON public.comment_reactions(user_id);

-- Enable RLS on comment_reactions
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for comment_reactions
CREATE POLICY "Anyone can view comment reactions"
ON public.comment_reactions FOR SELECT
USING (true);

CREATE POLICY "Users can add their own reactions"
ON public.comment_reactions FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can remove their own reactions"
ON public.comment_reactions FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- Add pinned_at column to posts for pin to profile feature
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP WITH TIME ZONE;

-- Add comments_disabled column to posts
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS comments_disabled BOOLEAN NOT NULL DEFAULT false;

-- Create post_reports table for reporting posts
CREATE TABLE IF NOT EXISTS public.post_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable RLS on post_reports
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_reports
CREATE POLICY "Users can report posts"
ON public.post_reports FOR INSERT
WITH CHECK ((SELECT auth.uid()) = reporter_id);

CREATE POLICY "Users can view their own reports"
ON public.post_reports FOR SELECT
USING ((SELECT auth.uid()) = reporter_id);

-- Create comment_reports table for reporting comments
CREATE TABLE IF NOT EXISTS public.comment_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable RLS on comment_reports
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for comment_reports
CREATE POLICY "Users can report comments"
ON public.comment_reports FOR INSERT
WITH CHECK ((SELECT auth.uid()) = reporter_id);

CREATE POLICY "Users can view their own comment reports"
ON public.comment_reports FOR SELECT
USING ((SELECT auth.uid()) = reporter_id);

-- Create hidden_posts table for hiding posts from feed
CREATE TABLE IF NOT EXISTS public.hidden_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS on hidden_posts
ALTER TABLE public.hidden_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for hidden_posts
CREATE POLICY "Users can manage their hidden posts"
ON public.hidden_posts FOR ALL
USING ((SELECT auth.uid()) = user_id);

-- Create muted_authors table for muting users
CREATE TABLE IF NOT EXISTS public.muted_authors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  muted_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, muted_user_id)
);

-- Enable RLS on muted_authors
ALTER TABLE public.muted_authors ENABLE ROW LEVEL SECURITY;

-- RLS policies for muted_authors
CREATE POLICY "Users can manage their muted authors"
ON public.muted_authors FOR ALL
USING ((SELECT auth.uid()) = user_id);

-- Create RPC to get threaded comments with reactions
CREATE OR REPLACE FUNCTION public.get_threaded_comments(
  p_post_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  comment_id UUID,
  parent_comment_id UUID,
  author_id UUID,
  author_username TEXT,
  author_full_name TEXT,
  author_avatar_url TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  reaction_counts JSONB,
  user_reaction TEXT,
  reply_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS comment_id,
    c.parent_comment_id,
    c.user_id AS author_id,
    p.username AS author_username,
    p.full_name AS author_full_name,
    p.avatar_url AS author_avatar_url,
    c.content,
    c.created_at,
    c.updated_at,
    COALESCE(
      (SELECT jsonb_object_agg(emoji, cnt)
       FROM (
         SELECT cr.emoji, COUNT(*) as cnt
         FROM comment_reactions cr
         WHERE cr.comment_id = c.id
         GROUP BY cr.emoji
       ) reaction_agg),
      '{}'::jsonb
    ) AS reaction_counts,
    (SELECT cr.emoji 
     FROM comment_reactions cr 
     WHERE cr.comment_id = c.id AND cr.user_id = p_user_id
     LIMIT 1) AS user_reaction,
    (SELECT COUNT(*) FROM post_comments replies WHERE replies.parent_comment_id = c.id) AS reply_count
  FROM post_comments c
  INNER JOIN profiles p ON c.user_id = p.id
  WHERE c.post_id = p_post_id
    AND c.is_deleted = false
  ORDER BY c.parent_comment_id NULLS FIRST, c.created_at ASC;
END;
$$;