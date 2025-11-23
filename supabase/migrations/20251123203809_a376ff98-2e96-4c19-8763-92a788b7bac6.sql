-- DNA v1.0 LOCKDOWN: Fix RLS performance warnings
-- Wrap auth.uid() in SELECT to prevent re-evaluation for each row

-- Fix post_reactions policy
DROP POLICY IF EXISTS "Users can add their own reactions" ON public.post_reactions;
CREATE POLICY "Users can add their own reactions" 
  ON public.post_reactions 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Fix post_bookmarks policy
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON public.post_bookmarks;
CREATE POLICY "Users can create their own bookmarks" 
  ON public.post_bookmarks 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);