
-- Fix RLS performance issues by optimizing auth.uid() calls and removing duplicate policies

-- First, drop ALL existing policies that are causing issues
-- Communities policies
DROP POLICY IF EXISTS "Allow public read communities" ON public.communities;
DROP POLICY IF EXISTS "Allow users to create communities" ON public.communities;
DROP POLICY IF EXISTS "Allow user to update own community" ON public.communities;
DROP POLICY IF EXISTS "Allow user to delete own community" ON public.communities;
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON public.communities;
DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;
DROP POLICY IF EXISTS "Users can update own communities" ON public.communities;
DROP POLICY IF EXISTS "Users can delete own communities" ON public.communities;

-- Events policies
DROP POLICY IF EXISTS "Allow public read events" ON public.events;
DROP POLICY IF EXISTS "Allow users to create events" ON public.events;
DROP POLICY IF EXISTS "Allow user to update own event" ON public.events;
DROP POLICY IF EXISTS "Allow user to delete own event" ON public.events;
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can view events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;
DROP POLICY IF EXISTS "Users can update events they created or admins can update any" ON public.events;
DROP POLICY IF EXISTS "Users can delete events they created or admins can delete any" ON public.events;
DROP POLICY IF EXISTS "Users and admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can feature any event" ON public.events;

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Posts policies
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

-- Now create optimized, consolidated policies

-- COMMUNITIES - Single policy per action with optimized auth calls
CREATE POLICY "Communities viewable by everyone" 
  ON public.communities 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create communities" 
  ON public.communities 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Users can update own communities" 
  ON public.communities 
  FOR UPDATE 
  USING ((SELECT auth.uid()) = created_by);

CREATE POLICY "Users can delete own communities" 
  ON public.communities 
  FOR DELETE 
  USING ((SELECT auth.uid()) = created_by);

-- EVENTS - Single policy per action with optimized auth calls
CREATE POLICY "Events viewable by everyone" 
  ON public.events 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create events" 
  ON public.events 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Users and admins can update events" 
  ON public.events 
  FOR UPDATE 
  USING ((SELECT auth.uid()) = created_by OR public.is_admin_user((SELECT auth.uid())));

CREATE POLICY "Users and admins can delete events" 
  ON public.events 
  FOR DELETE 
  USING ((SELECT auth.uid()) = created_by OR public.is_admin_user((SELECT auth.uid())));

-- PROFILES - Single policy per action with optimized auth calls
CREATE POLICY "Profiles viewable by everyone or owner" 
  ON public.profiles 
  FOR SELECT 
  USING (is_public = true OR (SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING ((SELECT auth.uid()) = id);

-- POSTS - Single policy per action with optimized auth calls
CREATE POLICY "Published posts viewable by everyone or author" 
  ON public.posts 
  FOR SELECT 
  USING (is_published = true AND (moderation_status = 'approved' OR (SELECT auth.uid()) = user_id));

CREATE POLICY "Users can insert own posts" 
  ON public.posts 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own posts" 
  ON public.posts 
  FOR UPDATE 
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own posts" 
  ON public.posts 
  FOR DELETE 
  USING ((SELECT auth.uid()) = user_id);
