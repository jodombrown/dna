
-- Create contributions table to track user activity across the platform
CREATE TABLE public.contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('post', 'initiative', 'event', 'opportunity', 'community', 'newsletter')),
  target_id UUID NOT NULL,
  target_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add Row Level Security
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- Users can view their own contributions
CREATE POLICY "Users can view their own contributions" 
  ON public.contributions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- System can insert contributions (for tracking)
CREATE POLICY "System can insert contributions" 
  ON public.contributions 
  FOR INSERT 
  WITH CHECK (true);

-- Users can view contributions of public profiles
CREATE POLICY "Public contributions viewable" 
  ON public.contributions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = contributions.user_id 
      AND profiles.is_public = true
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_contributions_user_id ON public.contributions(user_id);
CREATE INDEX idx_contributions_type ON public.contributions(type);
CREATE INDEX idx_contributions_created_at ON public.contributions(created_at DESC);
