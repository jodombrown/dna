-- Add group_id column to events table to support group-hosted events
ALTER TABLE events ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_group_id ON events(group_id);

-- Update RLS policies to allow group members to view group events
CREATE POLICY "Group members can view group events"
ON events FOR SELECT
USING (
  group_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = events.group_id
    AND group_members.user_id = auth.uid()
  )
);