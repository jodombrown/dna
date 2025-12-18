-- ============================================================
-- Migration: Create Regions Table for DNA Regional Hubs
-- Description: Stores African regions for the Regional Hubs feature
-- ============================================================

-- Create regions table
CREATE TABLE IF NOT EXISTS public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_name VARCHAR(100) NOT NULL,
  region_slug VARCHAR(50) NOT NULL UNIQUE,
  region_code VARCHAR(10) NOT NULL UNIQUE,
  tagline VARCHAR(200) NOT NULL,
  description_short TEXT NOT NULL,
  description_full TEXT NOT NULL,
  hero_image_url TEXT NOT NULL,
  map_coordinates JSONB NOT NULL DEFAULT '{}'::jsonb,
  key_sectors TEXT[] NOT NULL DEFAULT '{}',
  diaspora_population_estimate INTEGER,
  timezone_primary VARCHAR(50) NOT NULL,
  languages_primary TEXT[] NOT NULL DEFAULT '{}',
  interest_tags TEXT[] DEFAULT '{}',
  skill_relevance TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_regions_slug ON public.regions(region_slug);
CREATE INDEX IF NOT EXISTS idx_regions_status ON public.regions(status);

-- Enable Row Level Security
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access for published regions
CREATE POLICY "Regions are viewable by everyone"
  ON public.regions FOR SELECT USING (status = 'published');

-- Ensure the updated_at trigger function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_regions_updated_at ON public.regions;
CREATE TRIGGER update_regions_updated_at
  BEFORE UPDATE ON public.regions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add table comment
COMMENT ON TABLE public.regions IS 'African regions for DNA Regional Hubs - intelligence surfaces for the African diaspora';
