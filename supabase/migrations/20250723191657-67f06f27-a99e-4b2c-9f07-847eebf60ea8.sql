-- Fix Auth RLS performance warnings and multiple permissive policies

-- Fix user_connections RLS policies to use (select auth.uid()) for better performance
DROP POLICY IF EXISTS "Users can view their connections" ON public.user_connections;
DROP POLICY IF EXISTS "Users can create their own connections" ON public.user_connections;
DROP POLICY IF EXISTS "Users can delete their own connections" ON public.user_connections;

CREATE POLICY "Users can view their connections" 
  ON public.user_connections 
  FOR SELECT 
  USING (((select auth.uid()) = user_id) OR ((select auth.uid()) = connection_id));

CREATE POLICY "Users can create their own connections" 
  ON public.user_connections 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own connections" 
  ON public.user_connections 
  FOR DELETE 
  USING (((select auth.uid()) = user_id) OR ((select auth.uid()) = connection_id));

-- Fix beta_feedback RLS policies to use (select auth.uid()) and consolidate multiple SELECT policies
DROP POLICY IF EXISTS "Users can view their own beta feedback" ON public.beta_feedback;
DROP POLICY IF EXISTS "Users can create their own beta feedback" ON public.beta_feedback;
DROP POLICY IF EXISTS "Admins can view all beta feedback" ON public.beta_feedback;

-- Consolidated SELECT policy for beta_feedback (combines admin and user access)
CREATE POLICY "Beta feedback access policy" 
  ON public.beta_feedback 
  FOR SELECT 
  USING (((select auth.uid()) = user_id) OR is_admin_user((select auth.uid())));

CREATE POLICY "Users can create their own beta feedback" 
  ON public.beta_feedback 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix beta_applications RLS policies to use (select auth.uid())
DROP POLICY IF EXISTS "Beta applications can be viewed by admins" ON public.beta_applications;
DROP POLICY IF EXISTS "Admins can update beta applications" ON public.beta_applications;

CREATE POLICY "Beta applications can be viewed by admins" 
  ON public.beta_applications 
  FOR SELECT 
  USING (is_admin_user((select auth.uid())));

CREATE POLICY "Admins can update beta applications" 
  ON public.beta_applications 
  FOR UPDATE 
  USING (is_admin_user((select auth.uid())));