-- Fix Auth RLS Initialization Plan warnings by wrapping auth.uid() in subqueries
-- This prevents re-evaluation of auth.uid() for each row, improving performance

-- Fix beta_waitlist policies - already uses auth.email() which is correct

-- Fix event_reports policies
DROP POLICY IF EXISTS "Users can report events" ON public.event_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.event_reports;
DROP POLICY IF EXISTS "Event creators can view reports" ON public.event_reports;

-- Consolidate the two SELECT policies into one for better performance
CREATE POLICY "Users can view event reports" ON public.event_reports
  FOR SELECT USING (
    reported_by = (SELECT auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_reports.event_id 
      AND events.created_by = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can report events" ON public.event_reports
  FOR INSERT WITH CHECK (reported_by = (SELECT auth.uid()));

-- Fix username_history policies
DROP POLICY IF EXISTS "Users can view own username history" ON public.username_history;
CREATE POLICY "Users can view own username history" ON public.username_history
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Fix comments policies
DROP POLICY IF EXISTS "Users can view comments on visible posts" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

CREATE POLICY "Users can view comments on visible posts" ON public.comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = comments.post_id 
      AND (
        p.visibility = 'public' 
        OR p.author_id = (SELECT auth.uid())
        OR (p.visibility = 'connections' AND EXISTS (
          SELECT 1 FROM public.connections c
          WHERE c.status = 'accepted'
          AND ((c.a = (SELECT auth.uid()) AND c.b = p.author_id) 
               OR (c.b = (SELECT auth.uid()) AND c.a = p.author_id))
        ))
      )
    )
  );

CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (author_id = (SELECT auth.uid()));

-- Fix feed_research_responses policies
DROP POLICY IF EXISTS "Users can insert own feed research" ON public.feed_research_responses;
DROP POLICY IF EXISTS "Users can view own feed research" ON public.feed_research_responses;
DROP POLICY IF EXISTS "Users can update own feed research" ON public.feed_research_responses;
DROP POLICY IF EXISTS "Admins can view all feed research" ON public.feed_research_responses;

-- Consolidate SELECT policies
CREATE POLICY "Users can view feed research" ON public.feed_research_responses
  FOR SELECT USING (
    user_id = (SELECT auth.uid())
    OR public.has_role((SELECT auth.uid()), 'admin')
  );

CREATE POLICY "Users can insert own feed research" ON public.feed_research_responses
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own feed research" ON public.feed_research_responses
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- Fix duplicate index issue on profiles table
DROP INDEX IF EXISTS public.profiles_username_ci_idx;