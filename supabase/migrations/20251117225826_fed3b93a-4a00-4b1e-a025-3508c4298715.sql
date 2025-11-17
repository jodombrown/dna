-- Optimize RLS policies for performance
-- Fix auth RLS initialization plan issues and consolidate multiple permissive policies

-- =====================================================
-- 1. FEED_ENGAGEMENT_EVENTS - Consolidate and optimize
-- =====================================================
DROP POLICY IF EXISTS "Users can track their own engagement" ON public.feed_engagement_events;
DROP POLICY IF EXISTS "Users can view their own engagement" ON public.feed_engagement_events;
DROP POLICY IF EXISTS "Admins can view all engagement" ON public.feed_engagement_events;

-- Single optimized SELECT policy
CREATE POLICY "Users can view engagement" 
ON public.feed_engagement_events 
FOR SELECT 
USING (user_id = (select auth.uid()));

-- Optimized INSERT policy
CREATE POLICY "Users can track engagement" 
ON public.feed_engagement_events 
FOR INSERT 
WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 2. GROUP_MEMBERS - Consolidate and optimize
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.group_members;
DROP POLICY IF EXISTS "Group creators can view members" ON public.group_members;
DROP POLICY IF EXISTS "Users can view public group members" ON public.group_members;
DROP POLICY IF EXISTS "Allow users to join groups" ON public.group_members;
DROP POLICY IF EXISTS "Group creators can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Allow users to leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Group creators can remove members" ON public.group_members;

-- Single optimized SELECT policy
CREATE POLICY "Members can view group memberships" 
ON public.group_members 
FOR SELECT 
USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.groups 
    WHERE id = group_members.group_id 
    AND (created_by = (select auth.uid()) OR privacy = 'public')
  )
);

-- Optimized INSERT policy
CREATE POLICY "Users can join groups" 
ON public.group_members 
FOR INSERT 
WITH CHECK (user_id = (select auth.uid()));

-- Optimized UPDATE policy
CREATE POLICY "Group creators can update members" 
ON public.group_members 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.groups 
    WHERE id = group_members.group_id 
    AND created_by = (select auth.uid())
  )
);

-- Single optimized DELETE policy
CREATE POLICY "Users can leave or creators can remove" 
ON public.group_members 
FOR DELETE 
USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.groups 
    WHERE id = group_members.group_id 
    AND created_by = (select auth.uid())
  )
);

-- =====================================================
-- 3. EVENTS - Consolidate and optimize
-- =====================================================
DROP POLICY IF EXISTS "Users can view public events" ON public.events;
DROP POLICY IF EXISTS "Users can view group events they have access to" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Organizers can update their own events" ON public.events;
DROP POLICY IF EXISTS "Organizers can delete their own events" ON public.events;

-- Single optimized SELECT policy
CREATE POLICY "Users can view accessible events" 
ON public.events 
FOR SELECT 
USING (
  is_public = true
  OR organizer_id = (select auth.uid())
  OR (
    group_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = events.group_id 
      AND user_id = (select auth.uid())
      AND is_banned = false
    )
  )
);

-- Optimized INSERT policy
CREATE POLICY "Authenticated users can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (organizer_id = (select auth.uid()));

-- Optimized UPDATE policy
CREATE POLICY "Organizers can update events" 
ON public.events 
FOR UPDATE 
USING (organizer_id = (select auth.uid()));

-- Optimized DELETE policy
CREATE POLICY "Organizers can delete events" 
ON public.events 
FOR DELETE 
USING (organizer_id = (select auth.uid()));

-- =====================================================
-- 4. ANALYTICS_EVENTS - Consolidate and optimize
-- =====================================================
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can track their own events" ON public.analytics_events;

-- Single optimized INSERT policy
CREATE POLICY "Users can track analytics" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (user_id = (select auth.uid()) OR user_id IS NULL);