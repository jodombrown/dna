-- Fix additional database performance issues

-- Add missing index for communities.moderated_by foreign key to improve query performance
CREATE INDEX IF NOT EXISTS idx_communities_moderated_by ON public.communities(moderated_by);

-- Remove unused index that was just created but is not being used
DROP INDEX IF EXISTS idx_events_created_by;