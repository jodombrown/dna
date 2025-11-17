-- Create feed_engagement_events table for ADIN analytics
CREATE TABLE IF NOT EXISTS public.feed_engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  post_type TEXT NOT NULL,
  linked_entity_type TEXT,
  linked_entity_id UUID,
  action TEXT NOT NULL CHECK (action IN ('view', 'click_through', 'like', 'unlike', 'comment', 'reshare', 'bookmark', 'unbookmark')),
  surface TEXT NOT NULL CHECK (surface IN ('home', 'profile', 'space', 'event', 'mobile', 'bookmarks')),
  tab TEXT CHECK (tab IN ('all', 'network', 'my_posts', 'bookmarks')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_feed_engagement_user_id ON public.feed_engagement_events(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_engagement_post_id ON public.feed_engagement_events(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_engagement_action ON public.feed_engagement_events(action);
CREATE INDEX IF NOT EXISTS idx_feed_engagement_created_at ON public.feed_engagement_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_engagement_user_created ON public.feed_engagement_events(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.feed_engagement_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events (for client-side tracking)
CREATE POLICY "Users can track their own engagement"
  ON public.feed_engagement_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own events
CREATE POLICY "Users can view their own engagement"
  ON public.feed_engagement_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all events
CREATE POLICY "Admins can view all engagement"
  ON public.feed_engagement_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );
