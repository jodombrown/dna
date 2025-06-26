
-- Clean up remaining duplicate policies that are causing multiple_permissive_policies warnings

-- Event registrations - consolidate duplicate SELECT policies
DROP POLICY IF EXISTS "Users can view event registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can view their registrations" ON public.event_registrations;

-- Events - consolidate duplicate SELECT policies  
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Everyone can view events" ON public.events;

-- Initiatives - consolidate duplicate SELECT policies
DROP POLICY IF EXISTS "Users can view initiatives" ON public.initiatives;

-- Profiles - consolidate duplicate SELECT policies
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Projects - consolidate duplicate SELECT policies
DROP POLICY IF EXISTS "Users can view public projects" ON public.projects;

-- User roles - consolidate duplicate SELECT policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Now create single, consolidated policies for each table

-- Event registrations - single SELECT policy
CREATE POLICY "Users can view their event registrations" ON public.event_registrations 
FOR SELECT USING ((select auth.uid()) = user_id);

-- Initiatives - single SELECT policy (keeping the existing "Allow read initiatives")
-- No need to recreate since "Allow read initiatives" already exists

-- Profiles - single SELECT policy (keeping the existing "Public profiles are viewable by everyone") 
-- No need to recreate since "Public profiles are viewable by everyone" already exists

-- Projects - single SELECT policy (keeping the existing "Allow read projects")
-- No need to recreate since "Allow read projects" already exists

-- User roles - single SELECT policy (keeping the existing "Users can view all roles")
-- No need to recreate since "Users can view all roles" already exists

-- Events - single SELECT policy (keeping the existing "Allow public read events")
-- No need to recreate since "Allow public read events" already exists
