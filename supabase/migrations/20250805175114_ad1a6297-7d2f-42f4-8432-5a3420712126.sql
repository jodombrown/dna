-- Fix security issues from linter warnings

-- 1. Fix search_path for functions
ALTER FUNCTION public.calculate_profile_completeness_score_new() SET search_path TO 'public';
ALTER FUNCTION public.update_profile_completeness_trigger_new() SET search_path TO 'public';

-- 2. Fix auth function calls in RLS policies for performance
DROP POLICY IF EXISTS "Users can create conversations if profile complete" ON public.conversations;

-- 3. Remove duplicate permissive policies and consolidate them
DROP POLICY IF EXISTS "Profiles are publicly viewable with completeness check" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone or owner" ON public.profiles;

-- Create consolidated profile visibility policy
CREATE POLICY "Profiles visibility policy"
ON public.profiles
FOR SELECT
USING (
  -- Public profiles with sufficient completeness OR owner access
  (is_public = true AND COALESCE(profile_completeness_score, 0) >= 50) 
  OR id = auth.uid()
);

-- Recreate conversation policy with optimized auth calls
CREATE POLICY "Conversation creation policy"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  -- Use subquery to avoid re-evaluation per row
  (SELECT public.can_send_messages(auth.uid())) = true
  AND (auth.uid() = user_1_id OR auth.uid() = user_2_id)
);