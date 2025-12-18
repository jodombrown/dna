-- ============================================================
-- Migration: Create Geographic Relevance Table for DNA Regional Hubs
-- Description: Links content entities to geographic hubs for location-based discovery
-- ============================================================

-- Create geographic_relevance table
CREATE TABLE IF NOT EXISTS public.geographic_relevance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  hub_type VARCHAR(20) NOT NULL CHECK (hub_type IN ('region', 'country', 'city')),
  hub_id UUID NOT NULL,
  relevance_type VARCHAR(50) DEFAULT 'tagged',
  relevance_score INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, hub_type, hub_id)
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_geo_rel_entity
  ON public.geographic_relevance(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_geo_rel_hub
  ON public.geographic_relevance(hub_type, hub_id);
CREATE INDEX IF NOT EXISTS idx_geo_rel_lookup
  ON public.geographic_relevance(hub_type, hub_id, entity_type);

-- Enable Row Level Security
ALTER TABLE public.geographic_relevance ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access for all geographic relevance records
CREATE POLICY "Geographic relevance viewable by everyone"
  ON public.geographic_relevance FOR SELECT USING (true);

-- Add table comment
COMMENT ON TABLE public.geographic_relevance IS 'Links content entities (posts, events, opportunities, etc.) to geographic hubs for location-based discovery';
