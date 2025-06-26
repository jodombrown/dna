
-- Drop existing policies before recreating them to avoid conflicts

-- Phase metrics policies
DROP POLICY IF EXISTS "Allow read to all" ON public.phase_metrics;
DROP POLICY IF EXISTS "Admins can insert metrics" ON public.phase_metrics;
DROP POLICY IF EXISTS "Admins can update metrics" ON public.phase_metrics;
DROP POLICY IF EXISTS "Admins can delete metrics" ON public.phase_metrics;

-- Communities policies
DROP POLICY IF EXISTS "Allow public read communities" ON public.communities;
DROP POLICY IF EXISTS "Allow users to create communities" ON public.communities;
DROP POLICY IF EXISTS "Allow user to update own community" ON public.communities;
DROP POLICY IF EXISTS "Allow user to delete own community" ON public.communities;

-- Events policies
DROP POLICY IF EXISTS "Allow public read events" ON public.events;
DROP POLICY IF EXISTS "Allow users to create events" ON public.events;
DROP POLICY IF EXISTS "Allow user to update own event" ON public.events;
DROP POLICY IF EXISTS "Allow user to delete own event" ON public.events;

-- Initiatives policies
DROP POLICY IF EXISTS "Allow read initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Users can create initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Users can update own initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Users can delete own initiatives" ON public.initiatives;

-- Onboarding events policies
DROP POLICY IF EXISTS "Owner can access their onboarding events" ON public.onboarding_events;

-- Projects policies
DROP POLICY IF EXISTS "Allow read projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Event registrations policies
DROP POLICY IF EXISTS "Users can view their registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can register for events" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can update their registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can delete their registrations" ON public.event_registrations;

-- User connections policies
DROP POLICY IF EXISTS "Users can view connections they are part of" ON public.user_connections;
DROP POLICY IF EXISTS "Users can create connections" ON public.user_connections;
DROP POLICY IF EXISTS "Users can delete their connections" ON public.user_connections;
DROP POLICY IF EXISTS "Users can view connections" ON public.user_connections;

-- Connections policies
DROP POLICY IF EXISTS "Users can view their connections" ON public.connections;
DROP POLICY IF EXISTS "Users can send connection requests" ON public.connections;
DROP POLICY IF EXISTS "Users can update connections they received" ON public.connections;
DROP POLICY IF EXISTS "Users can create connection requests" ON public.connections;
DROP POLICY IF EXISTS "Users can update connections they're involved in" ON public.connections;

-- User roles policies
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Messages policies
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages they received" ON public.messages;
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;

-- Now create the new policies
-- Phase metrics policies
CREATE POLICY "Allow read to all" ON public.phase_metrics FOR SELECT USING (true);
CREATE POLICY "Admins can insert metrics" ON public.phase_metrics FOR INSERT WITH CHECK (public.has_role((select auth.uid()), 'admin'));
CREATE POLICY "Admins can update metrics" ON public.phase_metrics FOR UPDATE USING (public.has_role((select auth.uid()), 'admin'));
CREATE POLICY "Admins can delete metrics" ON public.phase_metrics FOR DELETE USING (public.has_role((select auth.uid()), 'admin'));

-- Communities policies
CREATE POLICY "Allow public read communities" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Allow users to create communities" ON public.communities FOR INSERT WITH CHECK ((select auth.uid())::text = created_by::text);
CREATE POLICY "Allow user to update own community" ON public.communities FOR UPDATE USING ((select auth.uid())::text = created_by::text);
CREATE POLICY "Allow user to delete own community" ON public.communities FOR DELETE USING ((select auth.uid())::text = created_by::text);

-- Events policies
CREATE POLICY "Allow public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow users to create events" ON public.events FOR INSERT WITH CHECK ((select auth.uid())::text = created_by::text);
CREATE POLICY "Allow user to update own event" ON public.events FOR UPDATE USING ((select auth.uid())::text = created_by::text);
CREATE POLICY "Allow user to delete own event" ON public.events FOR DELETE USING ((select auth.uid())::text = created_by::text);

-- Initiatives policies
CREATE POLICY "Allow read initiatives" ON public.initiatives FOR SELECT USING (true);
CREATE POLICY "Users can create initiatives" ON public.initiatives FOR INSERT WITH CHECK ((select auth.uid()) = creator_id);
CREATE POLICY "Users can update own initiatives" ON public.initiatives FOR UPDATE USING ((select auth.uid()) = creator_id);
CREATE POLICY "Users can delete own initiatives" ON public.initiatives FOR DELETE USING ((select auth.uid()) = creator_id);

-- Onboarding events policies
CREATE POLICY "Owner can access their onboarding events" ON public.onboarding_events FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- Projects policies
CREATE POLICY "Allow read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT WITH CHECK ((select auth.uid()) = creator_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING ((select auth.uid()) = creator_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING ((select auth.uid()) = creator_id);

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (is_public = true OR (select auth.uid()) = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((select auth.uid()) = id);

-- Event registrations policies
CREATE POLICY "Users can view their registrations" ON public.event_registrations FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can register for events" ON public.event_registrations FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their registrations" ON public.event_registrations FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their registrations" ON public.event_registrations FOR DELETE USING ((select auth.uid()) = user_id);

-- User connections policies
CREATE POLICY "Users can view connections they are part of" ON public.user_connections FOR SELECT USING ((select auth.uid()) = follower_id OR (select auth.uid()) = following_id);
CREATE POLICY "Users can create connections" ON public.user_connections FOR INSERT WITH CHECK ((select auth.uid()) = follower_id);
CREATE POLICY "Users can delete their connections" ON public.user_connections FOR DELETE USING ((select auth.uid()) = follower_id);

-- Connections policies
CREATE POLICY "Users can view their connections" ON public.connections FOR SELECT USING ((select auth.uid()) = requester_id OR (select auth.uid()) = recipient_id);
CREATE POLICY "Users can send connection requests" ON public.connections FOR INSERT WITH CHECK ((select auth.uid()) = requester_id);
CREATE POLICY "Users can update connections they received" ON public.connections FOR UPDATE USING ((select auth.uid()) = recipient_id);

-- User roles policies
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role((select auth.uid()), 'admin')) WITH CHECK (public.has_role((select auth.uid()), 'admin'));

-- Messages policies
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK ((select auth.uid()) = sender_id);
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING ((select auth.uid()) = sender_id OR (select auth.uid()) = recipient_id);
CREATE POLICY "Users can update messages they received" ON public.messages FOR UPDATE USING ((select auth.uid()) = recipient_id);
