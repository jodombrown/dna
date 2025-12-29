-- DNA Platform: Releases & Features Management System
-- Migration: Create releases tables and views

-- ============================================================================
-- MAIN RELEASES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  version VARCHAR(20),  -- e.g., "1.2", "2.0" for major releases
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  description TEXT NOT NULL,

  -- Categorization
  category VARCHAR(20) NOT NULL CHECK (category IN (
    'CONNECT', 'CONVENE', 'COLLABORATE', 'CONTRIBUTE', 'CONVEY', 'PLATFORM'
  )),
  tags TEXT[] DEFAULT '{}',  -- Additional tags like ['messaging', 'real-time', 'mobile']

  -- Dates
  release_date DATE NOT NULL,
  archived_at TIMESTAMPTZ,  -- Null until manually or auto-archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Status management
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
    'draft', 'scheduled', 'published', 'archived'
  )),
  is_pinned BOOLEAN DEFAULT FALSE,  -- Override auto-archive

  -- Media
  hero_type VARCHAR(20) DEFAULT 'gradient' CHECK (hero_type IN (
    'gradient', 'image', 'video', 'animation', 'map', 'chat', 'network', 'notification'
  )),
  hero_image_url TEXT,
  hero_video_url TEXT,

  -- CTA
  cta_text VARCHAR(50) DEFAULT 'Try it now',
  cta_link VARCHAR(200),

  -- SEO
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),

  -- Analytics
  view_count INTEGER DEFAULT 0,

  -- Author
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- FEATURE DETAILS TABLE (bullet points for each release)
-- ============================================================================
CREATE TABLE IF NOT EXISTS release_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  feature_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RELEASE MEDIA GALLERY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS release_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'gif')),
  url TEXT NOT NULL,
  alt_text VARCHAR(200),
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RELEASE CHANGELOG TABLE (for version updates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS release_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  change_type VARCHAR(20) CHECK (change_type IN (
    'added', 'improved', 'fixed', 'removed', 'security'
  )),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_category ON releases(category);
CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_releases_slug ON releases(slug);
CREATE INDEX IF NOT EXISTS idx_releases_archived_at ON releases(archived_at);
CREATE INDEX IF NOT EXISTS idx_release_features_release_id ON release_features(release_id);
CREATE INDEX IF NOT EXISTS idx_release_media_release_id ON release_media(release_id);
CREATE INDEX IF NOT EXISTS idx_release_changelog_release_id ON release_changelog(release_id);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_releases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS releases_updated_at ON releases;
CREATE TRIGGER releases_updated_at
  BEFORE UPDATE ON releases
  FOR EACH ROW
  EXECUTE FUNCTION update_releases_updated_at();

-- ============================================================================
-- VIEW: FEATURED RELEASES (last 30 days, not archived)
-- ============================================================================
CREATE OR REPLACE VIEW v_featured_releases AS
SELECT
  r.*,
  EXTRACT(DAY FROM NOW() - r.release_date::timestamp) as days_since_release,
  COALESCE(
    (SELECT array_agg(rf.feature_text ORDER BY rf.sort_order)
     FROM release_features rf
     WHERE rf.release_id = r.id),
    ARRAY[]::TEXT[]
  ) as features
FROM releases r
WHERE r.status = 'published'
  AND r.release_date >= CURRENT_DATE - INTERVAL '30 days'
  AND r.archived_at IS NULL
ORDER BY r.release_date DESC;

-- ============================================================================
-- VIEW: RECENT RELEASES (31-90 days)
-- ============================================================================
CREATE OR REPLACE VIEW v_recent_releases AS
SELECT
  r.*,
  EXTRACT(DAY FROM NOW() - r.release_date::timestamp) as days_since_release,
  COALESCE(
    (SELECT array_agg(rf.feature_text ORDER BY rf.sort_order)
     FROM release_features rf
     WHERE rf.release_id = r.id),
    ARRAY[]::TEXT[]
  ) as features
FROM releases r
WHERE r.status = 'published'
  AND r.release_date < CURRENT_DATE - INTERVAL '30 days'
  AND r.release_date >= CURRENT_DATE - INTERVAL '90 days'
  AND r.archived_at IS NULL
ORDER BY r.release_date DESC;

-- ============================================================================
-- VIEW: ARCHIVED RELEASES
-- ============================================================================
CREATE OR REPLACE VIEW v_archived_releases AS
SELECT
  r.*,
  COALESCE(
    (SELECT array_agg(rf.feature_text ORDER BY rf.sort_order)
     FROM release_features rf
     WHERE rf.release_id = r.id),
    ARRAY[]::TEXT[]
  ) as features
FROM releases r
WHERE r.status = 'archived' OR r.archived_at IS NOT NULL
ORDER BY r.release_date DESC;

-- ============================================================================
-- VIEW: ALL PUBLISHED RELEASES WITH FEATURES
-- ============================================================================
CREATE OR REPLACE VIEW v_all_releases AS
SELECT
  r.*,
  EXTRACT(DAY FROM NOW() - r.release_date::timestamp) as days_since_release,
  CASE
    WHEN r.status = 'archived' OR r.archived_at IS NOT NULL THEN 'archived'
    WHEN r.release_date >= CURRENT_DATE - INTERVAL '30 days' THEN 'featured'
    WHEN r.release_date >= CURRENT_DATE - INTERVAL '90 days' THEN 'recent'
    ELSE 'archived'
  END as lifecycle_stage,
  COALESCE(
    (SELECT array_agg(rf.feature_text ORDER BY rf.sort_order)
     FROM release_features rf
     WHERE rf.release_id = r.id),
    ARRAY[]::TEXT[]
  ) as features,
  COALESCE(
    (SELECT array_agg(jsonb_build_object(
      'id', rm.id,
      'media_type', rm.media_type,
      'url', rm.url,
      'alt_text', rm.alt_text,
      'caption', rm.caption
    ) ORDER BY rm.sort_order)
     FROM release_media rm
     WHERE rm.release_id = r.id),
    ARRAY[]::JSONB[]
  ) as media,
  COALESCE(
    (SELECT array_agg(jsonb_build_object(
      'id', rc.id,
      'change_type', rc.change_type,
      'description', rc.description,
      'created_at', rc.created_at
    ) ORDER BY rc.created_at DESC)
     FROM release_changelog rc
     WHERE rc.release_id = r.id),
    ARRAY[]::JSONB[]
  ) as changelog
FROM releases r
WHERE r.status = 'published' OR r.status = 'archived'
ORDER BY r.release_date DESC;

-- ============================================================================
-- RPC: GET FEATURED RELEASES COUNT (for pill badge)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_featured_releases_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM releases
    WHERE status = 'published'
      AND release_date >= CURRENT_DATE - INTERVAL '30 days'
      AND archived_at IS NULL
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- RPC: INCREMENT VIEW COUNT
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_release_view_count(release_slug VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE releases
  SET view_count = view_count + 1
  WHERE slug = release_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RPC: AUTO-ARCHIVE RELEASES (for Edge Function)
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_archive_releases()
RETURNS TABLE (archived_count INTEGER, archived_slugs TEXT[]) AS $$
DECLARE
  v_archived_count INTEGER;
  v_archived_slugs TEXT[];
BEGIN
  -- Get slugs that will be archived
  SELECT array_agg(slug) INTO v_archived_slugs
  FROM releases
  WHERE status = 'published'
    AND is_pinned = FALSE
    AND release_date < CURRENT_DATE - INTERVAL '90 days';

  -- Archive releases older than 90 days that aren't pinned
  WITH archived AS (
    UPDATE releases
    SET
      status = 'archived',
      archived_at = NOW()
    WHERE status = 'published'
      AND is_pinned = FALSE
      AND release_date < CURRENT_DATE - INTERVAL '90 days'
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO v_archived_count FROM archived;

  RETURN QUERY SELECT v_archived_count, COALESCE(v_archived_slugs, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RPC: GET RELATED RELEASES
-- ============================================================================
CREATE OR REPLACE FUNCTION get_related_releases(
  p_release_id UUID,
  p_category VARCHAR DEFAULT NULL,
  p_limit INTEGER DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  slug VARCHAR,
  title VARCHAR,
  subtitle VARCHAR,
  category VARCHAR,
  release_date DATE,
  hero_type VARCHAR,
  hero_image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.slug,
    r.title,
    r.subtitle,
    r.category,
    r.release_date,
    r.hero_type,
    r.hero_image_url
  FROM releases r
  WHERE r.id != p_release_id
    AND r.status IN ('published', 'archived')
    AND (p_category IS NULL OR r.category = p_category)
  ORDER BY
    CASE WHEN r.category = p_category THEN 0 ELSE 1 END,
    r.release_date DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_changelog ENABLE ROW LEVEL SECURITY;

-- Public read access for published/archived releases
CREATE POLICY "Public read access for published releases"
  ON releases FOR SELECT
  USING (status IN ('published', 'archived'));

CREATE POLICY "Public read access for release features"
  ON release_features FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM releases r
      WHERE r.id = release_features.release_id
      AND r.status IN ('published', 'archived')
    )
  );

CREATE POLICY "Public read access for release media"
  ON release_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM releases r
      WHERE r.id = release_media.release_id
      AND r.status IN ('published', 'archived')
    )
  );

CREATE POLICY "Public read access for release changelog"
  ON release_changelog FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM releases r
      WHERE r.id = release_changelog.release_id
      AND r.status IN ('published', 'archived')
    )
  );

-- Admin write access (assuming admin check via service role or separate admin table)
-- For now, authenticated users with specific role can manage releases
CREATE POLICY "Admin write access for releases"
  ON releases FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (p.is_admin = true OR p.role = 'admin')
    )
  );

CREATE POLICY "Admin write access for release features"
  ON release_features FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (p.is_admin = true OR p.role = 'admin')
    )
  );

CREATE POLICY "Admin write access for release media"
  ON release_media FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (p.is_admin = true OR p.role = 'admin')
    )
  );

CREATE POLICY "Admin write access for release changelog"
  ON release_changelog FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (p.is_admin = true OR p.role = 'admin')
    )
  );

-- ============================================================================
-- SAMPLE DATA (for development/testing)
-- ============================================================================
INSERT INTO releases (
  slug, version, title, subtitle, description, category, tags,
  release_date, status, hero_type, cta_text, cta_link
) VALUES
(
  'hashtag-ownership-system',
  '1.2',
  'Hashtag Ownership System',
  'Own your narrative with personal hashtag domains',
  'Members can now claim and own up to 5 hashtags, creating personal content territories within the DNA ecosystem. Build authority around topics you care about.',
  'CONNECT',
  ARRAY['content', 'ownership', 'engagement'],
  CURRENT_DATE - INTERVAL '5 days',
  'published',
  'gradient',
  'Claim Your Hashtags',
  '/hashtags/claim'
),
(
  'spaces-collaboration-hub',
  '2.0',
  'Spaces: Your Collaboration Hub',
  'Where ideas become reality through collective action',
  'Introducing Spaces - dedicated environments where diaspora members come together to collaborate on projects, initiatives, and movements. Create public or private spaces, invite contributors, and track progress together.',
  'COLLABORATE',
  ARRAY['spaces', 'collaboration', 'projects', 'teamwork'],
  CURRENT_DATE - INTERVAL '15 days',
  'published',
  'network',
  'Create a Space',
  '/collaborate/spaces/new'
),
(
  'real-time-messaging-upgrade',
  '1.5',
  'Real-Time Messaging Upgrade',
  'Faster, richer conversations that keep you connected',
  'Experience lightning-fast message delivery with our upgraded real-time infrastructure. New features include typing indicators, read receipts, and reaction emojis to make conversations more expressive.',
  'CONNECT',
  ARRAY['messaging', 'real-time', 'communication'],
  CURRENT_DATE - INTERVAL '45 days',
  'published',
  'chat',
  'Start a Conversation',
  '/messaging'
),
(
  'convene-event-discovery',
  '1.0',
  'Convene: Event Discovery',
  'Find gatherings that matter to your journey',
  'Discover events happening across the diaspora. From tech meetups to cultural celebrations, find opportunities to connect in person or virtually with community members who share your interests.',
  'CONVENE',
  ARRAY['events', 'discovery', 'gatherings', 'networking'],
  CURRENT_DATE - INTERVAL '60 days',
  'published',
  'map',
  'Explore Events',
  '/convene/events'
)
ON CONFLICT (slug) DO NOTHING;

-- Add features for sample releases
INSERT INTO release_features (release_id, feature_text, sort_order)
SELECT r.id, f.feature_text, f.sort_order
FROM releases r
CROSS JOIN (
  VALUES
    ('hashtag-ownership-system', 'Claim up to 5 hashtags per account', 0),
    ('hashtag-ownership-system', 'Approval workflow for contested tags', 1),
    ('hashtag-ownership-system', 'Ownership analytics dashboard', 2),
    ('hashtag-ownership-system', 'Transfer and release capabilities', 3),
    ('spaces-collaboration-hub', 'Create public or invite-only spaces', 0),
    ('spaces-collaboration-hub', 'Assign roles: Lead, Core Contributor, Member', 1),
    ('spaces-collaboration-hub', 'Integrated task tracking and milestones', 2),
    ('spaces-collaboration-hub', 'Shared resources and document library', 3),
    ('spaces-collaboration-hub', 'Activity feed for space updates', 4),
    ('real-time-messaging-upgrade', 'Instant message delivery under 100ms', 0),
    ('real-time-messaging-upgrade', 'Typing indicators show when others are composing', 1),
    ('real-time-messaging-upgrade', 'Read receipts for message confirmation', 2),
    ('real-time-messaging-upgrade', 'Emoji reactions to messages', 3),
    ('convene-event-discovery', 'Browse events by location, date, or topic', 0),
    ('convene-event-discovery', 'Virtual, in-person, and hybrid event support', 1),
    ('convene-event-discovery', 'RSVP and calendar integration', 2),
    ('convene-event-discovery', 'Event recommendations based on your interests', 3)
) AS f(slug, feature_text, sort_order)
WHERE r.slug = f.slug
ON CONFLICT DO NOTHING;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_featured_releases_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_release_view_count(VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_related_releases(UUID, VARCHAR, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auto_archive_releases() TO service_role;
