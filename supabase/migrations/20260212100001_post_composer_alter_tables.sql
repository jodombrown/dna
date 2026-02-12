-- ============================================================
-- DNA Post Composer — Alter Existing Tables Migration
-- Adds composer attribution tracking to existing content tables
-- ============================================================

-- Posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS composer_mode TEXT DEFAULT 'post';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS context TEXT;

-- Stories table (convey_items or stories depending on existing schema)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stories') THEN
    ALTER TABLE stories ADD COLUMN IF NOT EXISTS composer_mode TEXT DEFAULT 'story';
    ALTER TABLE stories ADD COLUMN IF NOT EXISTS series_id UUID;
    ALTER TABLE stories ADD COLUMN IF NOT EXISTS call_to_action JSONB;
    ALTER TABLE stories ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;
  END IF;
END $$;

-- Events table
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') THEN
    ALTER TABLE events ADD COLUMN IF NOT EXISTS composer_mode TEXT DEFAULT 'event';
    ALTER TABLE events ADD COLUMN IF NOT EXISTS timezone_displays JSONB DEFAULT '[]';
    ALTER TABLE events ADD COLUMN IF NOT EXISTS co_hosts JSONB DEFAULT '[]';
    ALTER TABLE events ADD COLUMN IF NOT EXISTS related_space_id UUID;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS rsvp_questions JSONB DEFAULT '[]';
  END IF;
END $$;

-- Spaces table (collaboration_spaces or spaces depending on existing schema)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'collaboration_spaces') THEN
    ALTER TABLE collaboration_spaces ADD COLUMN IF NOT EXISTS composer_mode TEXT DEFAULT 'space';
    ALTER TABLE collaboration_spaces ADD COLUMN IF NOT EXISTS space_type TEXT DEFAULT 'project';
    ALTER TABLE collaboration_spaces ADD COLUMN IF NOT EXISTS roles_needed JSONB DEFAULT '[]';
    ALTER TABLE collaboration_spaces ADD COLUMN IF NOT EXISTS related_event_id UUID;
    ALTER TABLE collaboration_spaces ADD COLUMN IF NOT EXISTS initial_tasks JSONB DEFAULT '[]';
    ALTER TABLE collaboration_spaces ADD COLUMN IF NOT EXISTS regional_focus TEXT;
  ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'spaces') THEN
    ALTER TABLE spaces ADD COLUMN IF NOT EXISTS composer_mode TEXT DEFAULT 'space';
    ALTER TABLE spaces ADD COLUMN IF NOT EXISTS space_type TEXT DEFAULT 'project';
    ALTER TABLE spaces ADD COLUMN IF NOT EXISTS roles_needed JSONB DEFAULT '[]';
    ALTER TABLE spaces ADD COLUMN IF NOT EXISTS related_event_id UUID;
    ALTER TABLE spaces ADD COLUMN IF NOT EXISTS initial_tasks JSONB DEFAULT '[]';
    ALTER TABLE spaces ADD COLUMN IF NOT EXISTS regional_focus TEXT;
  END IF;
END $$;
