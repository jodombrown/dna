
-- Step 1: Drop all existing auth-related tables and their dependencies
-- We need to drop in the correct order due to foreign key constraints

-- Drop tables that reference other tables first
DROP TABLE IF EXISTS public.post_reactions CASCADE;
DROP TABLE IF EXISTS public.post_comments CASCADE;
DROP TABLE IF EXISTS public.post_shares CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.contribution_cards CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.connections CASCADE;
DROP TABLE IF EXISTS public.user_connections CASCADE;
DROP TABLE IF EXISTS public.community_memberships CASCADE;
DROP TABLE IF EXISTS public.event_registrations CASCADE;
DROP TABLE IF EXISTS public.newsletter_subscriptions CASCADE;
DROP TABLE IF EXISTS public.project_participants CASCADE;
DROP TABLE IF EXISTS public.onboarding_events CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS public.professionals CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop any existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop custom types if they exist
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Clean up any existing functions that might cause issues
DROP FUNCTION IF EXISTS public.update_post_counts() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
