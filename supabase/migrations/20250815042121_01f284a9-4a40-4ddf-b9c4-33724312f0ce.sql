-- Create project contributions table only
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