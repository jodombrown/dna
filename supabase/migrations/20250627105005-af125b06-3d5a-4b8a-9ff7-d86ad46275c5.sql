
-- Add missing indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_user_id ON public.onboarding_events(user_id);
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON public.professionals(user_id);

-- Remove unused indexes that are consuming storage and slowing down writes
DROP INDEX IF EXISTS idx_community_memberships_community_id;
DROP INDEX IF EXISTS idx_initiatives_creator_id;
DROP INDEX IF EXISTS idx_project_participants_user_id;
DROP INDEX IF EXISTS idx_projects_creator_id;
DROP INDEX IF EXISTS idx_user_connections_following_id;
