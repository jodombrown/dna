-- Add recent_searches column to profiles table to support personalized search
ALTER TABLE public.profiles 
ADD COLUMN recent_searches TEXT[] DEFAULT '{}';

-- Add index for better performance on recent searches
CREATE INDEX idx_profiles_recent_searches ON public.profiles USING GIN(recent_searches);

-- Add search_analytics table for tracking search behavior
CREATE TABLE public.search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  clicked_result_id TEXT,
  clicked_result_type TEXT,
  search_type TEXT DEFAULT 'standard',
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on search_analytics
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for search_analytics
CREATE POLICY "Users can view their own search analytics"
ON public.search_analytics
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search analytics"
ON public.search_analytics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add saved_searches table for users to save favorite searches
CREATE TABLE public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  alert_enabled BOOLEAN DEFAULT false,
  alert_frequency TEXT DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on saved_searches
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_searches
CREATE POLICY "Users can manage their own saved searches"
ON public.saved_searches
FOR ALL
USING (auth.uid() = user_id);

-- Add updated_at trigger for saved_searches
CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();