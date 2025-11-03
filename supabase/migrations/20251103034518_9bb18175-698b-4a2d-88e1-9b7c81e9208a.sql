-- Consolidate multiple permissive policies into single policies for performance
-- This reduces the number of policy evaluations per query

-- GROUPS: Consolidate 3 SELECT policies into 1
DROP POLICY IF EXISTS "Anyone can view public groups" ON public.groups;
DROP POLICY IF EXISTS "Members can view secret groups" ON public.groups;
DROP POLICY IF EXISTS "Members can view their private groups" ON public.groups;

CREATE POLICY "Users can view accessible groups" ON public.groups
FOR SELECT USING (
  privacy = 'public' OR
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = groups.id
      AND gm.user_id = (select auth.uid())
      AND gm.is_banned = false
  )
);

-- EVENTS: Consolidate 5 SELECT policies into 1
DROP POLICY IF EXISTS "Public events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Organizers can view their own events" ON public.events;
DROP POLICY IF EXISTS "Users can view their own events" ON public.events;
DROP POLICY IF EXISTS "Users can view their invited events" ON public.events;
DROP POLICY IF EXISTS "Users can view events they registered for" ON public.events;

CREATE POLICY "Users can view accessible events" ON public.events
FOR SELECT USING (
  is_public = true OR
  organizer_id = (select auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.event_attendees ea
    WHERE ea.event_id = events.id
      AND ea.user_id = (select auth.uid())
  )
);

-- EVENTS: Consolidate duplicate INSERT policies
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can create events" ON public.events;

CREATE POLICY "Authenticated users can create events" ON public.events
FOR INSERT WITH CHECK (organizer_id = (select auth.uid()));

-- EVENTS: Consolidate 3 UPDATE policies into 1
DROP POLICY IF EXISTS "Organizers can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;

CREATE POLICY "Organizers can update their events" ON public.events
FOR UPDATE USING (organizer_id = (select auth.uid()));

-- EVENT_ATTENDEES: Consolidate 2 SELECT policies into 1
DROP POLICY IF EXISTS "Users can view attendees of public events" ON public.event_attendees;
DROP POLICY IF EXISTS "Users can view attendees of their events" ON public.event_attendees;

CREATE POLICY "Users can view accessible event attendees" ON public.event_attendees
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_attendees.event_id
      AND (e.is_public = true OR e.organizer_id = (select auth.uid()))
  )
);

-- EVENT_ATTENDEES: Consolidate 2 UPDATE policies into 1
DROP POLICY IF EXISTS "Users can update their own RSVP" ON public.event_attendees;
DROP POLICY IF EXISTS "Organizers can update attendee status" ON public.event_attendees;

CREATE POLICY "Users can update event attendance" ON public.event_attendees
FOR UPDATE USING (
  user_id = (select auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_attendees.event_id
      AND e.organizer_id = (select auth.uid())
  )
);

-- GROUP_JOIN_REQUESTS: Consolidate 2 SELECT policies into 1
DROP POLICY IF EXISTS "Users can view their own join requests" ON public.group_join_requests;
DROP POLICY IF EXISTS "Admins can view group join requests" ON public.group_join_requests;

CREATE POLICY "Users can view accessible join requests" ON public.group_join_requests
FOR SELECT USING (
  user_id = (select auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_join_requests.group_id
      AND gm.user_id = (select auth.uid())
      AND gm.role IN ('owner', 'admin')
      AND gm.is_banned = false
  )
);

-- GROUP_POSTS: Consolidate 2 UPDATE policies into 1
DROP POLICY IF EXISTS "Authors can update their posts" ON public.group_posts;
DROP POLICY IF EXISTS "Moderators can manage posts" ON public.group_posts;

CREATE POLICY "Users can update group posts" ON public.group_posts
FOR UPDATE USING (
  author_id = (select auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_posts.group_id
      AND gm.user_id = (select auth.uid())
      AND gm.role IN ('owner', 'admin', 'moderator')
      AND gm.is_banned = false
  )
);