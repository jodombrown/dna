
-- Fix RLS performance issues by optimizing auth.uid() calls

-- Drop existing policies that have performance issues
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own contribution cards" ON public.contribution_cards;
DROP POLICY IF EXISTS "Users can update their own contribution cards" ON public.contribution_cards;
DROP POLICY IF EXISTS "Users can delete their own contribution cards" ON public.contribution_cards;

-- Recreate profiles policies with optimized auth.uid() calls
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles 
  FOR SELECT 
  USING (is_public = true OR (select auth.uid()) = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING ((select auth.uid()) = id);

-- Recreate posts policies with optimized auth.uid() calls
CREATE POLICY "Users can insert their own posts" 
  ON public.posts 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.posts 
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.posts 
  FOR DELETE 
  USING ((select auth.uid()) = user_id);

-- Recreate contribution_cards policies with optimized auth.uid() calls
CREATE POLICY "Users can insert their own contribution cards" 
  ON public.contribution_cards 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Users can update their own contribution cards" 
  ON public.contribution_cards 
  FOR UPDATE 
  USING ((select auth.uid()) = created_by);

CREATE POLICY "Users can delete their own contribution cards" 
  ON public.contribution_cards 
  FOR DELETE 
  USING ((select auth.uid()) = created_by);
