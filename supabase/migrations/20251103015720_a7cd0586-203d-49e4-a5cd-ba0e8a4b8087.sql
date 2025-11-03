-- Fix remaining auth.uid() performance issues in event_comments and events tables

-- EVENT_COMMENTS - Fix delete policy (uses author_id not user_id)
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.event_comments;
CREATE POLICY "Users can delete their own comments" ON public.event_comments
FOR DELETE USING (author_id = (select auth.uid()));

-- EVENTS - Fix all remaining policies with proper names
DROP POLICY IF EXISTS "Organizers can view their own events" ON public.events;
CREATE POLICY "Organizers can view their own events" ON public.events
FOR SELECT USING (organizer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view events they registered for" ON public.events;
CREATE POLICY "Users can view events they registered for" ON public.events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.event_attendees
    WHERE event_id = events.id
    AND user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
CREATE POLICY "Authenticated users can create events" ON public.events
FOR INSERT WITH CHECK (organizer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Organizers can update their own events" ON public.events;
CREATE POLICY "Organizers can update their own events" ON public.events
FOR UPDATE USING (organizer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Organizers can delete their own events" ON public.events;
CREATE POLICY "Organizers can delete their own events" ON public.events
FOR DELETE USING (organizer_id = (select auth.uid()));