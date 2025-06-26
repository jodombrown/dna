
-- Add missing indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_user_id ON public.onboarding_events(user_id);
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON public.professionals(user_id);

-- Remove unused indexes that are consuming storage and slowing down writes
DROP INDEX IF EXISTS idx_communities_search;
DROP INDEX IF EXISTS idx_community_memberships_community_id;
DROP INDEX IF EXISTS idx_events_search;
DROP INDEX IF EXISTS idx_form_submissions_ip_time;
DROP INDEX IF EXISTS idx_initiatives_creator;
DROP INDEX IF EXISTS idx_messages_conversation;
DROP INDEX IF EXISTS idx_professionals_expertise;
DROP INDEX IF EXISTS idx_professionals_search;
DROP INDEX IF EXISTS idx_profiles_availability_for_mentoring;
DROP INDEX IF EXISTS idx_profiles_current_country;
DROP INDEX IF EXISTS idx_profiles_diaspora_origin;
DROP INDEX IF EXISTS idx_profiles_engagement_intentions;
DROP INDEX IF EXISTS idx_profiles_impact_areas;
DROP INDEX IF EXISTS idx_profiles_looking_for_opportunities;
DROP INDEX IF EXISTS idx_profiles_profession;
DROP INDEX IF EXISTS idx_project_participants_project;
DROP INDEX IF EXISTS idx_project_participants_user;
DROP INDEX IF EXISTS idx_projects_creator;
DROP INDEX IF EXISTS idx_projects_impact_area;
DROP INDEX IF EXISTS idx_user_connections_follower;
DROP INDEX IF EXISTS idx_user_connections_following;
