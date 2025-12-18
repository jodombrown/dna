-- ============================================================
-- Migration: Create Hub Metrics Table for DNA Regional Hubs
-- Description: Stores aggregated metrics for regions, countries, and cities
-- ============================================================

-- Create hub_metrics table
CREATE TABLE IF NOT EXISTS public.hub_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_type VARCHAR(20) NOT NULL CHECK (hub_type IN ('region', 'country', 'city')),
  hub_id UUID NOT NULL,
  members_connected INTEGER DEFAULT 0,
  events_hosted INTEGER DEFAULT 0,
  projects_active INTEGER DEFAULT 0,
  contributions_total DECIMAL(15,2) DEFAULT 0,
  stories_published INTEGER DEFAULT 0,
  connections_made INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hub_type, hub_id)
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_hub_metrics_lookup
  ON public.hub_metrics(hub_type, hub_id);

-- Enable Row Level Security
ALTER TABLE public.hub_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access for all hub metrics
CREATE POLICY "Hub metrics are viewable by everyone"
  ON public.hub_metrics FOR SELECT USING (true);

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_hub_metrics_updated_at ON public.hub_metrics;
CREATE TRIGGER update_hub_metrics_updated_at
  BEFORE UPDATE ON public.hub_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add table comment
COMMENT ON TABLE public.hub_metrics IS 'Aggregated engagement metrics for Regional Hubs (regions, countries, cities)';
