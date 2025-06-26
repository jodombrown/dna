
-- Fix remaining RLS issues by dropping and recreating policies properly
-- Handle existing policies gracefully

-- Drop ALL existing policies for tables we're fixing
-- Community memberships
DROP POLICY IF EXISTS "Users can view community memberships" ON public.community_memberships;
DROP POLICY IF EXISTS "Users can join communities" ON public.community_memberships;
DROP POLICY IF EXISTS "Users can update their memberships" ON public.community_memberships;
DROP POLICY IF EXISTS "Users can leave communities" ON public.community_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.community_memberships;

-- Project participants  
DROP POLICY IF EXISTS "Users can view project participants" ON public.project_participants;
DROP POLICY IF EXISTS "Users can join projects" ON public.project_participants;
DROP POLICY IF EXISTS "Users can leave projects" ON public.project_participants;

-- Professionals
DROP POLICY IF EXISTS "Anyone can view professionals" ON public.professionals;
DROP POLICY IF EXISTS "Users can create professional profile" ON public.professionals;
DROP POLICY IF EXISTS "Users can update their professional profile" ON public.professionals;
DROP POLICY IF EXISTS "Users can delete their professional profile" ON public.professionals;
DROP POLICY IF EXISTS "Users can delete their own professional profile" ON public.professionals;
DROP POLICY IF EXISTS "Users can insert their own professional profile" ON public.professionals;
DROP POLICY IF EXISTS "Users can update their own professional profile" ON public.professionals;

-- Drop old duplicate policies that are still causing issues
DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;
DROP POLICY IF EXISTS "Community creators can delete their communities" ON public.communities;
DROP POLICY IF EXISTS "Community creators can update their communities" ON public.communities;
DROP POLICY IF EXISTS "Anyone can view communities" ON public.communities;
DROP POLICY IF EXISTS "Everyone can view communities" ON public.communities;
DROP POLICY IF EXISTS "Users can create communities" ON public.communities;
DROP POLICY IF EXISTS "Users can update their own communities" ON public.communities;

DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Event creators can delete their events" ON public.events;
DROP POLICY IF EXISTS "Event creators can update their events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can create events" ON public.events;

DROP POLICY IF EXISTS "Initiative creators can delete initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Initiative creators can update initiatives" ON public.initiatives;

DROP POLICY IF EXISTS "Project creators can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Project creators can update projects" ON public.projects;

DROP POLICY IF EXISTS "Public profile info viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can cancel their registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can update their own registrations" ON public.event_registrations;

DROP POLICY IF EXISTS "Users can delete connections they're involved in" ON public.connections;
DROP POLICY IF EXISTS "Users can view their own connections" ON public.connections;
DROP POLICY IF EXISTS "Users can create connection requests" ON public.connections;
DROP POLICY IF EXISTS "Users can update connections they're involved in" ON public.connections;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON public.messages;

DROP POLICY IF EXISTS "select_user_roles" ON public.user_roles;

-- Now create the optimized policies
-- Community memberships policies
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community memberships are viewable by all" ON public.community_memberships FOR SELECT USING (true);
CREATE POLICY "Users can create community memberships" ON public.community_memberships FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own community memberships" ON public.community_memberships FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own community memberships" ON public.community_memberships FOR DELETE USING ((select auth.uid()) = user_id);

-- Project participants policies  
ALTER TABLE public.project_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project participants are viewable by all" ON public.project_participants FOR SELECT USING (true);
CREATE POLICY "Users can create project participation" ON public.project_participants FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own project participation" ON public.project_participants FOR DELETE USING ((select auth.uid()) = user_id);

-- Professionals policies
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Professionals are viewable by all" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Users can create own professional profile" ON public.professionals FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own professional profile" ON public.professionals FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own professional profile" ON public.professionals FOR DELETE USING ((select auth.uid()) = user_id);
