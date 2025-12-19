-- ============================================================
-- Migration: Create Countries Table for DNA Regional Hubs
-- Description: Stores African countries linked to regions
-- ============================================================

-- Create countries table
CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_name VARCHAR(100) NOT NULL,
  country_slug VARCHAR(50) NOT NULL UNIQUE,
  country_code_iso2 VARCHAR(2) NOT NULL UNIQUE,
  country_code_iso3 VARCHAR(3) NOT NULL UNIQUE,
  region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  tagline VARCHAR(200),
  description_short TEXT,
  description_full TEXT,
  hero_image_url TEXT,
  flag_url TEXT NOT NULL,
  capital_city VARCHAR(100) NOT NULL,
  capital_coordinates JSONB NOT NULL DEFAULT '{}'::jsonb,
  population INTEGER,
  gdp_usd DECIMAL(15,2),
  gdp_growth_rate DECIMAL(5,2),
  key_sectors TEXT[] DEFAULT '{}',
  official_languages TEXT[] NOT NULL DEFAULT '{}',
  currency_code VARCHAR(3) NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  diaspora_population_estimate INTEGER,
  diaspora_top_destinations TEXT[] DEFAULT '{}',
  interest_tags TEXT[] DEFAULT '{}',
  skill_relevance TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_countries_slug ON public.countries(country_slug);
CREATE INDEX IF NOT EXISTS idx_countries_region ON public.countries(region_id);
CREATE INDEX IF NOT EXISTS idx_countries_status ON public.countries(status);

-- Enable Row Level Security
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access for published countries
CREATE POLICY "Countries are viewable by everyone"
  ON public.countries FOR SELECT USING (status = 'published');

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_countries_updated_at ON public.countries;
CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON public.countries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add table comment
COMMENT ON TABLE public.countries IS 'African countries for DNA Regional Hubs, linked to regions';
