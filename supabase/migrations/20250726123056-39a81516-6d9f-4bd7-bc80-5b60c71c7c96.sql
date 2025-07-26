-- Add search_analytics table for tracking search behavior (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.search_analytics (
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

-- Enable RLS on search_analytics (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'search_analytics') THEN
    ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own search analytics" ON public.search_analytics;
    DROP POLICY IF EXISTS "Users can insert their own search analytics" ON public.search_analytics;
    
    -- Create policies
    CREATE POLICY "Users can view their own search analytics"
    ON public.search_analytics
    FOR SELECT
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own search analytics"
    ON public.search_analytics
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Add saved_searches table for users to save favorite searches (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.saved_searches (
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

-- Enable RLS on saved_searches (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'saved_searches') THEN
    ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can manage their own saved searches" ON public.saved_searches;
    
    -- Create policy
    CREATE POLICY "Users can manage their own saved searches"
    ON public.saved_searches
    FOR ALL
    USING (auth.uid() = user_id);
    
    -- Add trigger for updated_at (only if it doesn't exist)
    DROP TRIGGER IF EXISTS update_saved_searches_updated_at ON public.saved_searches;
    CREATE TRIGGER update_saved_searches_updated_at
      BEFORE UPDATE ON public.saved_searches
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;