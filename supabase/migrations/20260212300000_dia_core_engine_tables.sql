-- ============================================================
-- DNA DIA CORE ENGINE — Database Schema
--
-- Tables: network_edges, dia_match_results, dia_nudges,
--         dia_conversations, dia_messages, user_nudge_state
--
-- The intelligence layer that powers matching, nudges, and chat.
-- ============================================================

-- ============================================================
-- NETWORK EDGES (Relationship Strength)
-- ============================================================

CREATE TABLE IF NOT EXISTS network_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_status TEXT NOT NULL DEFAULT 'connected',
  relationship_strength FLOAT NOT NULL DEFAULT 0.0,
  strength_signals JSONB NOT NULL DEFAULT '{}',
  connection_date TIMESTAMPTZ,
  last_interaction_date TIMESTAMPTZ,
  mutual_connection_count INTEGER DEFAULT 0,
  shared_space_count INTEGER DEFAULT 0,
  shared_event_count INTEGER DEFAULT 0,
  communication_frequency TEXT DEFAULT 'inactive',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

CREATE INDEX idx_network_edges_user ON network_edges(user_id);
CREATE INDEX idx_network_edges_connected ON network_edges(connected_user_id);
CREATE INDEX idx_network_edges_strength ON network_edges(user_id, relationship_strength DESC);
CREATE INDEX idx_network_edges_status ON network_edges(connection_status);

ALTER TABLE network_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own edges"
  ON network_edges FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "System can manage edges"
  ON network_edges FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- MATCH RESULTS (All match types)
-- ============================================================

CREATE TABLE IF NOT EXISTS dia_match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_category TEXT NOT NULL CHECK (match_category IN ('people', 'opportunity', 'space', 'event')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_entity_id UUID NOT NULL,
  match_score FLOAT NOT NULL,
  match_type TEXT NOT NULL,
  match_reasons JSONB NOT NULL DEFAULT '[]',
  signals JSONB NOT NULL DEFAULT '{}',
  surfaced_via TEXT[] DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acted_on', 'dismissed', 'expired', 'connected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  acted_on_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);

CREATE INDEX idx_match_results_user ON dia_match_results(user_id);
CREATE INDEX idx_match_results_category ON dia_match_results(match_category, user_id);
CREATE INDEX idx_match_results_status ON dia_match_results(status, user_id);
CREATE INDEX idx_match_results_score ON dia_match_results(match_score DESC);
CREATE INDEX idx_match_results_expires ON dia_match_results(expires_at);

ALTER TABLE dia_match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches"
  ON dia_match_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own matches"
  ON dia_match_results FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert matches"
  ON dia_match_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- NUDGES
-- ============================================================

CREATE TABLE IF NOT EXISTS dia_nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nudge_type TEXT NOT NULL,
  category TEXT NOT NULL,
  c_module TEXT NOT NULL,
  headline TEXT NOT NULL,
  body TEXT NOT NULL,
  action JSONB NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  delivery_channel TEXT NOT NULL,
  timing JSONB NOT NULL DEFAULT '{}',
  trigger_event TEXT NOT NULL,
  match_id UUID,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'delivered', 'seen', 'acted_on', 'dismissed', 'expired', 'suppressed')),
  delivered_at TIMESTAMPTZ,
  acted_on_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_nudges_user ON dia_nudges(user_id);
CREATE INDEX idx_nudges_status ON dia_nudges(user_id, status);
CREATE INDEX idx_nudges_type ON dia_nudges(nudge_type);
CREATE INDEX idx_nudges_delivery ON dia_nudges(delivery_channel, status);
CREATE INDEX idx_nudges_created ON dia_nudges(created_at DESC);

ALTER TABLE dia_nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nudges"
  ON dia_nudges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own nudges"
  ON dia_nudges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert nudges"
  ON dia_nudges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- DIA CHAT CONVERSATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS dia_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dia_conversations_user ON dia_conversations(user_id, created_at DESC);

ALTER TABLE dia_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own DIA conversations"
  ON dia_conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- DIA CHAT MESSAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS dia_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES dia_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'dia')),
  content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  attached_results JSONB DEFAULT '[]',
  suggested_actions JSONB DEFAULT '[]',
  intent TEXT,
  entities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dia_messages_conversation ON dia_messages(conversation_id, created_at);

ALTER TABLE dia_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own DIA messages"
  ON dia_messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM dia_conversations WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- USER NUDGE STATE (for suppression logic)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_nudge_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nudges_today INTEGER DEFAULT 0,
  nudges_today_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_nudge_by_type JSONB DEFAULT '{}',
  dismiss_count_by_type JSONB DEFAULT '{}',
  dia_frequency TEXT DEFAULT 'normal' CHECK (dia_frequency IN ('frequent', 'normal', 'minimal', 'off')),
  timezone TEXT DEFAULT 'UTC',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_nudge_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own nudge state"
  ON user_nudge_state FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- HELPER: Update updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER network_edges_updated_at
  BEFORE UPDATE ON network_edges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_nudge_state_updated_at
  BEFORE UPDATE ON user_nudge_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- HELPER: Update dia_conversations message_count on insert
-- ============================================================

CREATE OR REPLACE FUNCTION update_dia_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dia_conversations
  SET message_count = message_count + 1,
      last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dia_message_insert_trigger
  AFTER INSERT ON dia_messages
  FOR EACH ROW EXECUTE FUNCTION update_dia_conversation_on_message();
