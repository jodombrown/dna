-- Create enhanced messaging and profile analytics tables

-- Profile views tracking
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  view_type TEXT DEFAULT 'profile_page',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Profile view policies
CREATE POLICY "Profile owners can view their analytics" ON public.profile_views
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Authenticated users can log views" ON public.profile_views  
  FOR INSERT WITH CHECK (viewer_id = auth.uid());

-- Post analytics tracking
CREATE TABLE IF NOT EXISTS public.post_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'view', 'like', 'comment', 'share'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, event_type, user_id, event_date)
);

-- Enable RLS
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;

-- Post analytics policies  
CREATE POLICY "Post authors can view analytics" ON public.post_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_analytics.post_id 
      AND posts.author_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can log events" ON public.post_analytics
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Search filters and preferences
CREATE TABLE IF NOT EXISTS public.search_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_searches JSONB DEFAULT '[]'::jsonb,
  default_filters JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.search_preferences ENABLE ROW LEVEL SECURITY;

-- Search preferences policies
CREATE POLICY "Users can manage their search preferences" ON public.search_preferences
  FOR ALL USING (user_id = auth.uid());

-- Messaging enhancements - Add read receipts and message status
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON public.profile_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_post_analytics_post_id ON public.post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_event_date ON public.post_analytics(event_date);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON public.messages(read_at);

-- Functions for analytics
CREATE OR REPLACE FUNCTION public.log_profile_view(
  p_profile_id UUID,
  p_view_type TEXT DEFAULT 'profile_page'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_viewer_id UUID := auth.uid();
BEGIN
  IF v_viewer_id IS NULL OR v_viewer_id = p_profile_id THEN
    RETURN; -- Don't log self-views or anonymous views
  END IF;
  
  INSERT INTO public.profile_views (viewer_id, profile_id, view_type)
  VALUES (v_viewer_id, p_profile_id, p_view_type)
  ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_post_event(
  p_post_id UUID,
  p_event_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;
  
  INSERT INTO public.post_analytics (post_id, event_type, user_id, metadata)
  VALUES (p_post_id, p_event_type, v_user_id, p_metadata)
  ON CONFLICT (post_id, event_type, user_id, event_date) 
  DO UPDATE SET 
    count = post_analytics.count + 1,
    metadata = p_metadata;
END;
$$;