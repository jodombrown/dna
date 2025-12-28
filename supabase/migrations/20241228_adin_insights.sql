-- ============================================================================
-- ADIN INSIGHTS TABLE
-- Migration for ADIN Phase 2 - Insights Cards
-- ============================================================================

CREATE TABLE IF NOT EXISTS adin_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  query_prompt TEXT NOT NULL,

  -- Categorization
  category TEXT DEFAULT 'general',
  region TEXT,

  -- Display control
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Scheduling
  start_date DATE,
  end_date DATE,

  -- Analytics
  click_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_adin_insights_active ON adin_insights(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_adin_insights_featured ON adin_insights(is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_adin_insights_category ON adin_insights(category, is_active);

-- RLS
ALTER TABLE adin_insights ENABLE ROW LEVEL SECURITY;

-- Everyone can read active insights
CREATE POLICY "adin_insights_select_active"
  ON adin_insights FOR SELECT TO authenticated
  USING (is_active = true);

-- Service role can manage all
CREATE POLICY "adin_insights_manage_service"
  ON adin_insights FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Seed initial insights data
INSERT INTO adin_insights (title, description, query_prompt, category, region, is_featured, display_order) VALUES
  ('Fintech Revolution', 'Nigeria leads Africa''s fintech boom with $1.2B+ raised in 2024', 'What are the latest fintech investment opportunities in Nigeria and how can diaspora investors participate?', 'fintech', 'west-africa', true, 1),
  ('Green Energy Surge', 'Kenya targets 100% renewable energy by 2030', 'What renewable energy investment opportunities exist in Kenya for diaspora investors?', 'energy', 'east-africa', true, 2),
  ('Tech Hub Growth', 'Ghana''s tech ecosystem attracts global attention', 'What is driving Ghana''s tech hub growth and what opportunities exist for diaspora professionals?', 'tech', 'west-africa', true, 3),
  ('AgriTech Innovation', 'Digital farming transforms Ethiopian agriculture', 'How is agritech transforming Ethiopian agriculture and what investment opportunities exist?', 'agriculture', 'east-africa', false, 4),
  ('Real Estate Boom', 'Rwanda''s Kigali sees unprecedented development', 'What are the real estate investment opportunities in Kigali, Rwanda for diaspora investors?', 'real-estate', 'east-africa', false, 5),
  ('Creative Economy', 'Nollywood and Afrobeats drive cultural exports', 'How is Africa''s creative economy growing and what opportunities exist in entertainment and media?', 'creative', 'west-africa', false, 6),
  ('Healthcare Innovation', 'Telemedicine expands across the continent', 'What healthcare and telemedicine opportunities are emerging across Africa?', 'healthcare', NULL, false, 7),
  ('Education Tech', 'EdTech startups address skills gap', 'What edtech opportunities exist in Africa to address the education and skills gap?', 'education', NULL, false, 8)
ON CONFLICT DO NOTHING;

-- Success message
DO $$ BEGIN RAISE NOTICE '✅ ADIN Insights table created and seeded!'; END $$;
