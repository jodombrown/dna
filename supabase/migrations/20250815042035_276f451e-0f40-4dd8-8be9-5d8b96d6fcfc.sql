-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  skills_needed TEXT[],
  timeline TEXT,
  impact_area TEXT,
  funding_goal NUMERIC,
  current_funding NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Projects are viewable by everyone" 
ON public.projects 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create project contributions table
CREATE TABLE public.project_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL,
  contribution_type TEXT NOT NULL, -- 'interest', 'time', 'skills', 'funding'
  time_commitment TEXT,
  skills_offered TEXT[],
  funding_interest NUMERIC,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_contributions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view contributions to their projects or their own contributions" 
ON public.project_contributions 
FOR SELECT 
USING (
  auth.uid() = contributor_id OR 
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND created_by = auth.uid())
);

CREATE POLICY "Users can create their own contributions" 
ON public.project_contributions 
FOR INSERT 
WITH CHECK (auth.uid() = contributor_id);

CREATE POLICY "Users can update their own contributions" 
ON public.project_contributions 
FOR UPDATE 
USING (auth.uid() = contributor_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();