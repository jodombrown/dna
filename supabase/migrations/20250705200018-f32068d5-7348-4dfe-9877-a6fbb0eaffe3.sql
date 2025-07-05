-- Fix database performance issues

-- Add back the index for events.created_by foreign key (it's actually needed)
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- Remove the unused communities.moderated_by index
DROP INDEX IF EXISTS idx_communities_moderated_by;