-- Create feature flags table for platform control
CREATE TABLE public.feature_flags (
  feature_key TEXT PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Feature flags are viewable by everyone" 
ON public.feature_flags 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify feature flags" 
ON public.feature_flags 
FOR ALL 
USING (is_admin_user(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_feature_flags_updated_at
BEFORE UPDATE ON public.feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default feature flags
INSERT INTO public.feature_flags (feature_key, is_enabled, notes) VALUES
('communities', false, 'Enable public community creation and discovery.'),
('organizations', false, 'Enable organization profiles and visibility.'),
('contribution_pathways', false, 'Turn on contribution pathways and volunteer matching.'),
('newsletters', false, 'Enables publishing and reading newsletter content.'),
('developer_debug_tools', true, 'Show debug widgets for internal testing only.');