
-- Add missing indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_community_memberships_community_id ON public.community_memberships(community_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_creator_id ON public.initiatives(creator_id);
CREATE INDEX IF NOT EXISTS idx_project_participants_user_id ON public.project_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_creator_id ON public.projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_following_id ON public.user_connections(following_id);

-- Remove unused indexes that are consuming storage and slowing down writes
DROP INDEX IF EXISTS idx_event_registrations_event_id;
DROP INDEX IF EXISTS idx_events_created_by;
DROP INDEX IF EXISTS idx_onboarding_events_user_id;
DROP INDEX IF EXISTS idx_professionals_user_id;
