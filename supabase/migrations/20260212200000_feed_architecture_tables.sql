-- ============================================================
-- DNA FEED ARCHITECTURE — Phase 2: Intelligence Stream
--
-- Tables: feed_items, feed_engagement, dia_feed_insights, user_feed_preferences
-- Triggers: Auto-create feed_items on content creation
-- ============================================================

-- ============================================================
-- FEED ITEMS (Materialized view of all content for fast querying)
-- ============================================================

CREATE TABLE IF NOT EXISTS feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'story', 'event', 'space', 'opportunity', 'milestone', 'activity')),
  content_id UUID NOT NULL,
  primary_c TEXT NOT NULL CHECK (primary_c IN ('CONNECT', 'CONVENE', 'COLLABORATE', 'CONTRIBUTE', 'CONVEY')),
  secondary_cs TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  audience TEXT NOT NULL DEFAULT 'public',
  audience_target_id UUID,
  tags TEXT[] DEFAULT '{}',
  regional_hub TEXT,
  related_space_id UUID,
  related_event_id UUID,
  engagement_score FLOAT DEFAULT 0,
  is_pro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for feed queries
CREATE INDEX idx_feed_items_created_at ON feed_items(created_at DESC);
CREATE INDEX idx_feed_items_content_type ON feed_items(content_type);
CREATE INDEX idx_feed_items_primary_c ON feed_items(primary_c);
CREATE INDEX idx_feed_items_created_by ON feed_items(created_by);
CREATE INDEX idx_feed_items_audience ON feed_items(audience);
CREATE INDEX idx_feed_items_regional_hub ON feed_items(regional_hub);
CREATE INDEX idx_feed_items_tags ON feed_items USING GIN(tags);
CREATE INDEX idx_feed_items_engagement ON feed_items(engagement_score DESC);
CREATE INDEX idx_feed_items_type_date ON feed_items(content_type, created_at DESC);

-- RLS
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public feed items"
  ON feed_items FOR SELECT
  USING (
    audience = 'public'
    OR created_by = auth.uid()
    OR (audience = 'connections' AND created_by IN (
      SELECT CASE WHEN requester_id = auth.uid() THEN receiver_id ELSE requester_id END
      FROM connections WHERE status = 'accepted'
      AND (requester_id = auth.uid() OR receiver_id = auth.uid())
    ))
    OR (audience = 'space_members' AND audience_target_id IN (
      SELECT space_id FROM space_members WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create own feed items"
  ON feed_items FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own feed items"
  ON feed_items FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- ============================================================
-- FEED ENGAGEMENT TRACKING
-- ============================================================

CREATE TABLE IF NOT EXISTS feed_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_item_id UUID NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'comment', 'reshare', 'bookmark', 'rsvp', 'join', 'interest', 'view', 'click')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(feed_item_id, user_id, action)
);

CREATE INDEX idx_feed_engagement_item ON feed_engagement(feed_item_id);
CREATE INDEX idx_feed_engagement_user ON feed_engagement(user_id);
CREATE INDEX idx_feed_engagement_action ON feed_engagement(action);

-- RLS
ALTER TABLE feed_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own engagement"
  ON feed_engagement FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Engagement counts are readable"
  ON feed_engagement FOR SELECT
  USING (true);

-- ============================================================
-- DIA FEED INSIGHTS
-- ============================================================

CREATE TABLE IF NOT EXISTS dia_feed_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  headline TEXT NOT NULL,
  body TEXT NOT NULL,
  data_points JSONB DEFAULT '[]',
  action_cta JSONB NOT NULL,
  secondary_cta JSONB,
  related_content_ids UUID[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  shown BOOLEAN DEFAULT FALSE,
  dismissed BOOLEAN DEFAULT FALSE,
  acted_on BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dia_insights_user ON dia_feed_insights(user_id);
CREATE INDEX idx_dia_insights_shown ON dia_feed_insights(user_id, shown, dismissed);
CREATE INDEX idx_dia_insights_expires ON dia_feed_insights(expires_at);

-- RLS
ALTER TABLE dia_feed_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own DIA insights"
  ON dia_feed_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own DIA insights"
  ON dia_feed_insights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- USER FEED PREFERENCES
-- ============================================================

CREATE TABLE IF NOT EXISTS user_feed_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_sort TEXT DEFAULT 'for_you',
  hidden_content_types TEXT[] DEFAULT '{}',
  muted_users UUID[] DEFAULT '{}',
  muted_tags TEXT[] DEFAULT '{}',
  preferred_regions TEXT[] DEFAULT '{}',
  dia_insight_frequency TEXT DEFAULT 'normal' CHECK (dia_insight_frequency IN ('frequent', 'normal', 'minimal', 'off')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE user_feed_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON user_feed_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- FEED ITEM TRIGGER: Auto-create feed_items on content creation
-- ============================================================

CREATE OR REPLACE FUNCTION create_feed_item()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO feed_items (content_type, content_id, primary_c, created_by, audience, tags, regional_hub, created_at)
  VALUES (
    TG_ARGV[0],
    NEW.id,
    TG_ARGV[1],
    COALESCE(NEW.author_id, NEW.created_by),
    COALESCE(NEW.privacy_level, NEW.audience, 'public'),
    COALESCE(NEW.tags, '{}'),
    NEW.regional_hub,
    COALESCE(NEW.created_at, NOW())
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't block content creation if feed item creation fails
  RAISE WARNING 'Failed to create feed_item: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers to content tables
-- Posts → CONNECT
CREATE TRIGGER posts_feed_trigger
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION create_feed_item('post', 'CONNECT');

-- Events → CONVENE
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events' AND table_schema = 'public') THEN
    EXECUTE 'CREATE TRIGGER events_feed_trigger AFTER INSERT ON events FOR EACH ROW EXECUTE FUNCTION create_feed_item(''event'', ''CONVENE'')';
  END IF;
END $$;

-- Spaces → COLLABORATE
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collaboration_spaces' AND table_schema = 'public') THEN
    EXECUTE 'CREATE TRIGGER spaces_feed_trigger AFTER INSERT ON collaboration_spaces FOR EACH ROW EXECUTE FUNCTION create_feed_item(''space'', ''COLLABORATE'')';
  END IF;
END $$;

-- Opportunities → CONTRIBUTE
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'opportunities' AND table_schema = 'public') THEN
    EXECUTE 'CREATE TRIGGER opportunities_feed_trigger AFTER INSERT ON opportunities FOR EACH ROW EXECUTE FUNCTION create_feed_item(''opportunity'', ''CONTRIBUTE'')';
  END IF;
END $$;

-- ============================================================
-- ENGAGEMENT SCORE UPDATE FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_feed_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feed_items
  SET engagement_score = (
    SELECT
      COALESCE(SUM(CASE
        WHEN action = 'like' THEN 1
        WHEN action = 'comment' THEN 2
        WHEN action = 'reshare' THEN 3
        WHEN action = 'bookmark' THEN 1
        WHEN action = 'rsvp' THEN 2
        WHEN action = 'join' THEN 2
        WHEN action = 'interest' THEN 2
        ELSE 0
      END), 0)
    FROM feed_engagement
    WHERE feed_item_id = COALESCE(NEW.feed_item_id, OLD.feed_item_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.feed_item_id, OLD.feed_item_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER feed_engagement_score_trigger
  AFTER INSERT OR DELETE ON feed_engagement
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_engagement_score();
