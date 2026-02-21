-- Alpha Testing Infrastructure Tables
-- Sprint 7: Launch Day Preparation

-- ─── Alpha Feedback Table ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS alpha_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('bug', 'feature_idea', 'confusion', 'love')),
  area TEXT,
  content TEXT NOT NULL,
  page_url TEXT,
  viewport TEXT,
  device_type TEXT CHECK (device_type IS NULL OR device_type IN ('mobile', 'desktop')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_alpha_feedback_created_at ON alpha_feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alpha_feedback_category ON alpha_feedback (category);

-- RLS: users can insert their own feedback, admins can read all
ALTER TABLE alpha_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own feedback"
  ON alpha_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own feedback"
  ON alpha_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all feedback"
  ON alpha_feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin' OR role = 'platform_admin')
    )
  );

-- ─── Alpha Invites Table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS alpha_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  email TEXT,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_alpha_invites_code ON alpha_invites (code);

ALTER TABLE alpha_invites ENABLE ROW LEVEL SECURITY;

-- Anyone can check if a code is valid (for the signup flow)
CREATE POLICY "Anyone can validate invite codes"
  ON alpha_invites
  FOR SELECT
  USING (true);

-- Only admins can manage invite codes
CREATE POLICY "Admins can manage invites"
  ON alpha_invites
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin' OR role = 'platform_admin')
    )
  );

-- Users can claim their own invite
CREATE POLICY "Users can claim invites"
  ON alpha_invites
  FOR UPDATE
  USING (claimed_by IS NULL OR claimed_by = auth.uid())
  WITH CHECK (auth.uid() = claimed_by);

-- Generate initial batch of 20 invite codes
INSERT INTO alpha_invites (code) VALUES
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8))),
  (upper(substr(md5(random()::text), 1, 8)));
