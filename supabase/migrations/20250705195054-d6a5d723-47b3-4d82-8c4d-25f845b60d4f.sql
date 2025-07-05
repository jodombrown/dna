-- Fix database performance issues

-- Add missing index for events.created_by foreign key to improve query performance
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- Remove unused indexes to improve write performance and reduce storage
DROP INDEX IF EXISTS idx_contributions_type;
DROP INDEX IF EXISTS idx_contributions_created_at;
DROP INDEX IF EXISTS idx_communities_moderated_by;
DROP INDEX IF EXISTS idx_profiles_newsletter_emails;