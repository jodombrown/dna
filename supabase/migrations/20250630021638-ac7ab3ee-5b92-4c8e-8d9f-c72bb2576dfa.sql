
-- Fix auth RLS initialization plan issues by wrapping auth.uid() calls in SELECT statements
-- and consolidate duplicate policies to improve performance

-- First, drop all existing duplicate policies on events table
DROP POLICY IF EXISTS "Allow public read events" ON public.events;
DROP POLICY IF EXISTS "Allow users to create events" ON public.events;
DROP POLICY IF EXISTS "Allow user to update own event" ON public.events;
DROP POLICY IF EXISTS "Allow user to delete own event" ON public.events;

-- Drop old policies on content_flags that may be duplicates
DROP POLICY IF EXISTS "Users can view their own flags" ON public.content_flags;
DROP POLICY IF EXISTS "Users can create flags" ON public.content_flags;
DROP POLICY IF EXISTS "Admins and moderators can view all flags" ON public.content_flags;
DROP POLICY IF EXISTS "Admins and moderators can update flags" ON public.content_flags;

-- Update existing events policies to use optimized auth calls
DROP POLICY IF EXISTS "Users can create events" ON public.events;
CREATE POLICY "Users can create events" 
  ON public.events 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Users can view events" ON public.events;
CREATE POLICY "Users can view events" 
  ON public.events 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can update events they created or admins can update any" ON public.events;
CREATE POLICY "Users can update events they created or admins can update any" 
  ON public.events 
  FOR UPDATE 
  USING ((SELECT auth.uid()) = created_by OR public.is_admin_user((SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can delete events they created or admins can delete any" ON public.events;
CREATE POLICY "Users can delete events they created or admins can delete any" 
  ON public.events 
  FOR DELETE 
  USING ((SELECT auth.uid()) = created_by OR public.is_admin_user((SELECT auth.uid())));

DROP POLICY IF EXISTS "Admins can feature any event" ON public.events;
CREATE POLICY "Admins can feature any event" 
  ON public.events 
  FOR UPDATE 
  USING (public.is_admin_user((SELECT auth.uid())))
  WITH CHECK (public.is_admin_user((SELECT auth.uid())));

-- Create consolidated content_flags policies with optimized auth calls
CREATE POLICY "Content flags access policy" 
  ON public.content_flags 
  FOR SELECT 
  USING (
    public.is_admin_user((SELECT auth.uid())) OR 
    (SELECT auth.uid()) = flagged_by
  );

CREATE POLICY "Users can create content flags" 
  ON public.content_flags 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Admins can update content flags" 
  ON public.content_flags 
  FOR UPDATE 
  USING (public.is_admin_user((SELECT auth.uid())));
