
-- ============================================
-- Sprint 11: Feed Engagement Tables
-- feed_reactions, feed_comments, feed_bookmarks, feed_reshares
-- ============================================

-- 1. feed_reactions
CREATE TABLE public.feed_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('asante', 'inspired', 'lets_build', 'powerful', 'insightful')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_type, content_id)
);

ALTER TABLE public.feed_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view reactions"
  ON public.feed_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own reactions"
  ON public.feed_reactions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own reactions"
  ON public.feed_reactions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own reactions"
  ON public.feed_reactions FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX idx_feed_reactions_content ON public.feed_reactions (content_type, content_id);
CREATE INDEX idx_feed_reactions_user ON public.feed_reactions (user_id);

-- 2. feed_comments
CREATE TABLE public.feed_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES public.feed_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view comments"
  ON public.feed_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON public.feed_comments FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own comments"
  ON public.feed_comments FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.feed_comments FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX idx_feed_comments_content ON public.feed_comments (content_type, content_id);
CREATE INDEX idx_feed_comments_user ON public.feed_comments (user_id);
CREATE INDEX idx_feed_comments_parent ON public.feed_comments (parent_comment_id);

-- 3. feed_bookmarks
CREATE TABLE public.feed_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_type, content_id)
);

ALTER TABLE public.feed_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON public.feed_bookmarks FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON public.feed_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.feed_bookmarks FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX idx_feed_bookmarks_user ON public.feed_bookmarks (user_id);
CREATE INDEX idx_feed_bookmarks_content ON public.feed_bookmarks (content_type, content_id);

-- 4. feed_reshares
CREATE TABLE public.feed_reshares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  commentary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feed_reshares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view reshares"
  ON public.feed_reshares FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own reshares"
  ON public.feed_reshares FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own reshares"
  ON public.feed_reshares FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX idx_feed_reshares_content ON public.feed_reshares (content_type, content_id);
CREATE INDEX idx_feed_reshares_user ON public.feed_reshares (user_id);
