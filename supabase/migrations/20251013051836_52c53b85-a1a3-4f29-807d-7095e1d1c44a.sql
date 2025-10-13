-- Create feed_research_responses table to capture user feedback
CREATE TABLE public.feed_research_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  value_rating TEXT NOT NULL,
  post_frequency TEXT NOT NULL,
  check_frequency TEXT NOT NULL,
  content_to_share JSONB DEFAULT '[]'::jsonb,
  content_to_see JSONB DEFAULT '[]'::jsonb,
  feature_ratings JSONB DEFAULT '{}'::jsonb,
  concerns JSONB DEFAULT '[]'::jsonb,
  differentiation_idea TEXT,
  dream_feature TEXT,
  use_case TEXT,
  wants_early_access BOOLEAN DEFAULT false,
  early_access_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feed_research_responses ENABLE ROW LEVEL SECURITY;

-- Users can insert their own responses
CREATE POLICY "Users can insert own feed research"
  ON public.feed_research_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own responses
CREATE POLICY "Users can view own feed research"
  ON public.feed_research_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own responses
CREATE POLICY "Users can update own feed research"
  ON public.feed_research_responses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all responses
CREATE POLICY "Admins can view all feed research"
  ON public.feed_research_responses
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_feed_research_user_id ON public.feed_research_responses(user_id);
CREATE INDEX idx_feed_research_created_at ON public.feed_research_responses(created_at DESC);