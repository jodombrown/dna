-- Remove remaining admin-related database functionality

-- Drop admin_users table and related functionality
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Drop remaining admin-related functions
DROP FUNCTION IF EXISTS public.is_admin_user(_user_id uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_admin_role(_user_id uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_platform_admin(_user_id uuid) CASCADE;
DROP FUNCTION IF EXISTS public.has_user_role(_user_id uuid, _role user_role) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(_user_id uuid) CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_role_to_profile() CASCADE;
DROP FUNCTION IF EXISTS public.get_platform_stats() CASCADE;

-- Drop admin-related enums
DROP TYPE IF EXISTS public.admin_role CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.moderation_status CASCADE;
DROP TYPE IF EXISTS public.flag_type CASCADE;

-- Remove admin-related column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_role CASCADE;

-- Keep only essential tables for the landing page:
-- profiles, communities, events, content_flags, contributions, 
-- contribution_cards, projects, initiatives, phase_metrics, form_submissions