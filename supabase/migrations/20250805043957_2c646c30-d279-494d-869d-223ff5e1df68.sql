-- Fix RLS performance issues by optimizing auth function calls
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own recommendations" ON public.user_recommendations;
DROP POLICY IF EXISTS "Users can update their own recommendations" ON public.user_recommendations;
DROP POLICY IF EXISTS "Users can view their own selections" ON public.user_onboarding_selections;
DROP POLICY IF EXISTS "Users can create their own selections" ON public.user_onboarding_selections;

-- Create optimized RLS policies with (select auth.uid()) for better performance
CREATE POLICY "Users can view their own recommendations" ON public.user_recommendations
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own recommendations" ON public.user_recommendations
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "System can create recommendations" ON public.user_recommendations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own selections" ON public.user_onboarding_selections
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own selections" ON public.user_onboarding_selections
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);