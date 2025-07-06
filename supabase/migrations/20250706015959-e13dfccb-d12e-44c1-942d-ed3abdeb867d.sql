-- Create projects table for contribution opportunities
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  impact_area text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create contributions table for tracking user contributions
CREATE TABLE public.contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('post', 'initiative', 'event', 'opportunity', 'community', 'newsletter')),
  target_id uuid NOT NULL,
  target_title text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- RLS policies for projects
CREATE POLICY "Allow read projects"
  ON public.projects
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own projects"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects
  FOR DELETE
  USING (auth.uid() = creator_id);

-- RLS policies for contributions
CREATE POLICY "Users can view contributions"
  ON public.contributions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = contributions.user_id 
      AND is_public = true
    ) OR auth.uid() = user_id
  );

CREATE POLICY "System can insert contributions"
  ON public.contributions
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_projects_creator_id ON public.projects(creator_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_impact_area ON public.projects(impact_area);
CREATE INDEX idx_projects_created_at ON public.projects(created_at);

CREATE INDEX idx_contributions_user_id ON public.contributions(user_id);
CREATE INDEX idx_contributions_type ON public.contributions(type);
CREATE INDEX idx_contributions_target_id ON public.contributions(target_id);
CREATE INDEX idx_contributions_created_at ON public.contributions(created_at);

-- Update triggers for timestamp management
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();