-- Drop tables that were only used by /app routes
-- These tables are not used by /connect, /collaborate, /contribute, or /phase pages

-- Drop connection-related tables (used only in /app)
DROP TABLE IF EXISTS public.adin_connection_matches CASCADE;
DROP TABLE IF EXISTS public.adin_connection_signals CASCADE;
DROP TABLE IF EXISTS public.connection_events CASCADE;
DROP TABLE IF EXISTS public.connection_intentions CASCADE;
DROP TABLE IF EXISTS public.connection_preferences CASCADE;
DROP TABLE IF EXISTS public.contact_requests CASCADE;

-- Drop any related functions that are no longer needed
DROP FUNCTION IF EXISTS public.is_connection_participant(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_participant_of_connection(uuid, uuid) CASCADE;