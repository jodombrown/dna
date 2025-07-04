-- Remove unused tables from the database
-- This migration removes tables that are not being used in the current application

-- Drop messaging system tables (not used in current landing page)
DROP TABLE IF EXISTS public.message_read_receipts CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.group_conversation_members CASCADE;
DROP TABLE IF EXISTS public.group_conversations CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- Drop job board related tables (not used in current application)
DROP TABLE IF EXISTS public.job_referrals CASCADE;
DROP TABLE IF EXISTS public.job_posts CASCADE;

-- Drop newsletter system tables (using edge functions instead)
DROP TABLE IF EXISTS public.newsletter_deliveries CASCADE;
DROP TABLE IF EXISTS public.newsletters CASCADE;

-- Drop advanced community features (not used in current prototype)
DROP TABLE IF EXISTS public.community_flags CASCADE;
DROP TABLE IF EXISTS public.community_memberships CASCADE;

-- Drop organization management tables (not used currently)
DROP TABLE IF EXISTS public.organization_members CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

-- Drop social media features (not used in current landing page)
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;

-- Drop advanced admin features (keeping basic admin_users)
DROP TABLE IF EXISTS public.admin_audit_log CASCADE;
DROP TABLE IF EXISTS public.admin_reports CASCADE;

-- Drop system monitoring (not needed for current prototype)
DROP TABLE IF EXISTS public.system_metrics CASCADE;
DROP TABLE IF EXISTS public.analytics_events CASCADE;

-- Drop contact requests (using email forms instead)
DROP TABLE IF EXISTS public.contact_requests CASCADE;

-- Keep these essential tables:
-- - profiles (user profiles)
-- - admin_users (basic admin functionality)
-- - communities (basic community data)
-- - events (event listings)
-- - content_flags (basic moderation)
-- - contributions (contribution tracking)
-- - contribution_cards (contribution opportunities)
-- - projects (project data)
-- - initiatives (initiative data)
-- - phase_metrics (phase tracking for the platform)
-- - form_submissions (form handling)