-- Create releases table
CREATE TABLE public.releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  version VARCHAR(20),
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  description TEXT NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN (
    'CONNECT', 'CONVENE', 'COLLABORATE', 'CONTRIBUTE', 'CONVEY', 'PLATFORM'
  )),
  tags TEXT[],
  release_date DATE NOT NULL,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
    'draft', 'scheduled', 'published', 'archived'
  )),
  is_pinned BOOLEAN DEFAULT FALSE,
  hero_type VARCHAR(20) DEFAULT 'gradient' CHECK (hero_type IN (
    'gradient', 'image', 'video', 'animation', 'map', 'chat', 'network', 'notification'
  )),
  hero_image_url TEXT,
  hero_video_url TEXT,
  cta_text VARCHAR(50) DEFAULT 'Try it now',
  cta_link VARCHAR(200),
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id)
);

-- Create release_features table
CREATE TABLE public.release_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
  feature_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_releases_status ON public.releases(status);
CREATE INDEX idx_releases_category ON public.releases(category);
CREATE INDEX idx_releases_release_date ON public.releases(release_date DESC);
CREATE INDEX idx_release_features_release_id ON public.release_features(release_id);

-- Enable RLS
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for releases
CREATE POLICY "Public can view published releases" ON public.releases
  FOR SELECT USING (status = 'published' OR status = 'archived');

CREATE POLICY "Admins can manage releases" ON public.releases
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for release_features
CREATE POLICY "Public can view release features" ON public.release_features
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.releases 
      WHERE releases.id = release_features.release_id 
      AND (releases.status = 'published' OR releases.status = 'archived')
    )
  );

CREATE POLICY "Admins can manage release features" ON public.release_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.releases 
      WHERE releases.id = release_features.release_id
    ) AND has_role(auth.uid(), 'admin')
  );

-- Create updated_at trigger
CREATE TRIGGER update_releases_updated_at
  BEFORE UPDATE ON public.releases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();