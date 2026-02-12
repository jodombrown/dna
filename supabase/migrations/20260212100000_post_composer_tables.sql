-- ============================================================
-- DNA Post Composer — Database Schema Migration
-- Phase 1: Composer Drafts, Attribution, DIA Tracking, Opportunities
-- ============================================================

-- ============================================================
-- COMPOSER DRAFTS
-- ============================================================

CREATE TABLE IF NOT EXISTS composer_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('post', 'story', 'event', 'space', 'opportunity')),
  base_fields JSONB NOT NULL DEFAULT '{}',
  mode_fields JSONB NOT NULL DEFAULT '{}',
  last_saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, mode)
);

ALTER TABLE composer_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own drafts"
  ON composer_drafts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- CONTENT ATTRIBUTION (Cross-C tracking)
-- ============================================================

CREATE TABLE IF NOT EXISTS content_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'story', 'event', 'space', 'opportunity')),
  content_id UUID NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_via TEXT NOT NULL DEFAULT 'post_composer',
  primary_c TEXT NOT NULL CHECK (primary_c IN ('CONNECT', 'CONVENE', 'COLLABORATE', 'CONTRIBUTE', 'CONVEY')),
  secondary_cs TEXT[] DEFAULT '{}',
  composer_mode TEXT NOT NULL,
  dia_suggested_mode BOOLEAN DEFAULT FALSE,
  dia_interactions INTEGER DEFAULT 0,
  cross_references JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attribution_user ON content_attribution(created_by);
CREATE INDEX idx_attribution_primary_c ON content_attribution(primary_c);
CREATE INDEX idx_attribution_content ON content_attribution(content_type, content_id);

ALTER TABLE content_attribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all attribution"
  ON content_attribution FOR SELECT
  USING (true);

CREATE POLICY "Users can create own attribution"
  ON content_attribution FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- ============================================================
-- DIA SUGGESTION TRACKING
-- ============================================================

CREATE TABLE IF NOT EXISTS dia_composer_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL,
  suggestion_message TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  accepted BOOLEAN DEFAULT NULL,
  composer_mode TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE dia_composer_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own DIA suggestions"
  ON dia_composer_suggestions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- OPPORTUNITIES TABLE (for Contribute module)
-- ============================================================

CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('need', 'offer')),
  category TEXT NOT NULL,
  compensation_type TEXT NOT NULL,
  compensation_details JSONB DEFAULT '{}',
  location_relevance TEXT NOT NULL,
  specific_region TEXT,
  specific_country TEXT,
  duration TEXT,
  deadline TIMESTAMPTZ,
  requirements TEXT,
  related_space_id UUID,
  budget_range JSONB,
  tags TEXT[] DEFAULT '{}',
  audience TEXT NOT NULL DEFAULT 'public',
  media JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'fulfilled', 'expired')),
  view_count INTEGER DEFAULT 0,
  interest_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_opportunities_direction ON opportunities(direction);
CREATE INDEX idx_opportunities_category ON opportunities(category);
CREATE INDEX idx_opportunities_location ON opportunities(location_relevance);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_created_by ON opportunities(created_by);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active opportunities"
  ON opportunities FOR SELECT
  USING (status = 'active' OR auth.uid() = created_by);

CREATE POLICY "Users can create opportunities"
  ON opportunities FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own opportunities"
  ON opportunities FOR UPDATE
  USING (auth.uid() = created_by);
