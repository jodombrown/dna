-- =====================================================
-- MIGRATION 005: Create event_roles table
-- Purpose: Team permissions for events
-- =====================================================

CREATE TABLE IF NOT EXISTS event_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Role type
  role TEXT NOT NULL CHECK (role IN (
    'owner',      -- Full control, can delete event, transfer ownership
    'cohost',     -- Almost full control, cannot delete or transfer
    'manager',    -- Can edit details, manage attendees, view analytics
    'checkin',    -- Can only check in attendees
    'promoter'    -- Can view event, share, see basic stats
  )),

  -- Granular permission overrides (optional)
  permissions JSONB DEFAULT '{}',
  /* Structure:
  {
    "can_edit_details": true,
    "can_manage_tickets": true,
    "can_view_attendees": true,
    "can_message_attendees": true,
    "can_check_in": true,
    "can_view_analytics": true,
    "can_manage_team": false,
    "can_access_payments": false
  }
  */

  -- Invitation tracking
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined', 'removed')),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One role per user per event
  UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_roles_event ON event_roles(event_id);
CREATE INDEX IF NOT EXISTS idx_event_roles_user ON event_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_event_roles_status ON event_roles(status);

-- RLS Policies
ALTER TABLE event_roles ENABLE ROW LEVEL SECURITY;

-- Users can view roles for events they're part of
DROP POLICY IF EXISTS "Users can view event roles they're part of" ON event_roles;
CREATE POLICY "Users can view event roles they're part of" ON event_roles
  FOR SELECT USING (
    user_id = auth.uid() OR
    event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()) OR
    event_id IN (SELECT event_id FROM event_roles WHERE user_id = auth.uid() AND status = 'active')
  );

-- Only organizers and cohosts can manage roles
DROP POLICY IF EXISTS "Organizers can manage roles" ON event_roles;
CREATE POLICY "Organizers can manage roles" ON event_roles
  FOR ALL USING (
    event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()) OR
    event_id IN (SELECT event_id FROM event_roles WHERE user_id = auth.uid() AND role IN ('owner', 'cohost') AND status = 'active')
  );

COMMENT ON TABLE event_roles IS 'Team members for events with role-based permissions';
COMMENT ON COLUMN event_roles.role IS 'owner (full), cohost (almost full), manager (edit/attendees), checkin (door only), promoter (view/share)';
