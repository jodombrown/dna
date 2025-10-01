-- Remove backend auth/logged-in user tables
-- Keeps all prototype/demo content for Connect, Collaborate, Contribute pages

-- Drop messaging system
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- Drop notifications system
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Drop user activity tracking
DROP TABLE IF EXISTS public.user_contributions CASCADE;
DROP TABLE IF EXISTS public.user_badges CASCADE;

-- Drop admin system
DROP TABLE IF EXISTS public.admin_notifications CASCADE;
DROP TABLE IF EXISTS public.admin_logs CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Drop beta signup system
DROP TABLE IF EXISTS public.magic_links CASCADE;
DROP TABLE IF EXISTS public.beta_applications CASCADE;

-- Drop related functions
DROP FUNCTION IF EXISTS public.handle_admin_user_creation() CASCADE;
DROP FUNCTION IF EXISTS public.auto_create_admin_user() CASCADE;
DROP FUNCTION IF EXISTS public.approve_beta_application(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.reject_beta_application(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.generate_magic_link(text, text, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.notify_beta_status(text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.add_notification(uuid, text, text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.trg_contrib_awards() CASCADE;
DROP FUNCTION IF EXISTS public.award_badge_if_missing(uuid, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.count_contrib(uuid, text) CASCADE;

-- Drop admin-related types
DROP TYPE IF EXISTS public.admin_role CASCADE;