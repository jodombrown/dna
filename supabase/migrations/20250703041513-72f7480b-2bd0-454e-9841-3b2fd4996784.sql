
-- Create events table (if it doesn't already exist, or update it)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  description TEXT,
  tags TEXT[],
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create initiatives table
CREATE TABLE IF NOT EXISTS public.initiatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  impact_area TEXT,
  creator_id UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create opportunities table
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  role_type TEXT,
  organization TEXT,
  location TEXT,
  deadline DATE,
  description TEXT,
  tags TEXT[],
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own events" ON public.events
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own events" ON public.events
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for initiatives
CREATE POLICY "Allow read initiatives" ON public.initiatives
  FOR SELECT USING (true);

CREATE POLICY "Users can create initiatives" ON public.initiatives
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own initiatives" ON public.initiatives
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own initiatives" ON public.initiatives
  FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for opportunities
CREATE POLICY "Anyone can view opportunities" ON public.opportunities
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create opportunities" ON public.opportunities
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own opportunities" ON public.opportunities
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own opportunities" ON public.opportunities
  FOR DELETE USING (auth.uid() = created_by);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_initiatives_created_at ON public.initiatives(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at DESC);

-- Update posts table to support sharing these content types
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS shared_event_id UUID REFERENCES public.events(id);
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS shared_initiative_id UUID REFERENCES public.initiatives(id);
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS shared_opportunity_id UUID REFERENCES public.opportunities(id);
