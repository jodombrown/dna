
-- Delete all existing user data to start fresh
-- Note: This will permanently delete all user accounts and profiles

-- First, delete all profile data
DELETE FROM public.profiles;

-- Delete all user roles
DELETE FROM public.user_roles;

-- Delete all onboarding events
DELETE FROM public.onboarding_events;

-- Delete all user connections
DELETE FROM public.user_connections;

-- Delete all messages
DELETE FROM public.messages;

-- Delete all connections
DELETE FROM public.connections;

-- Delete all community memberships
DELETE FROM public.community_memberships;

-- Delete all event registrations
DELETE FROM public.event_registrations;

-- Delete all project participants
DELETE FROM public.project_participants;

-- Delete all form submissions
DELETE FROM public.form_submissions;

-- Reset any auto-increment sequences or counters
-- This ensures clean slate for follower/following counts, etc.
UPDATE public.profiles SET followers_count = 0, following_count = 0 WHERE id IS NOT NULL;
