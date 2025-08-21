-- SECURITY FIX: Restrict profiles table access to prevent data theft
-- This fixes the critical vulnerability where user personal data was publicly accessible

BEGIN;

-- Drop the overly permissive profiles SELECT policy that allowed public data access
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;

-- Create secure profile access policy that respects privacy settings
CREATE POLICY "Secure profile access with privacy controls" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can always view their own profile
  (auth.uid() = id) 
  OR 
  -- Public profiles with proper privacy filtering using the existing privacy function
  (
    COALESCE(is_public, false) = true 
    AND COALESCE(profile_completeness_score, 0) >= 50
    -- Use the existing can_view_field function to respect visibility settings
    AND public.can_view_field(visibility, 'profile', auth.uid(), id)
  )
);

-- Fix user_dna_points table to prevent exposure of user activity data
DROP POLICY IF EXISTS "DNA points are viewable by everyone" ON public.user_dna_points;
DROP POLICY IF EXISTS "Public can view DNA points" ON public.user_dna_points;

CREATE POLICY "Users can view their own DNA points and admins can view all" 
ON public.user_dna_points 
FOR SELECT 
USING (
  (auth.uid() = user_id) 
  OR 
  public.is_admin_user(auth.uid())
);

-- Fix user_adin_profile table to remove dangerous public access
DROP POLICY IF EXISTS "ADIN profiles viewable with user access" ON public.user_adin_profile;
DROP POLICY IF EXISTS "Public can view ADIN profiles" ON public.user_adin_profile;

CREATE POLICY "Users can view their own ADIN profile and connected users" 
ON public.user_adin_profile 
FOR SELECT 
USING (
  (auth.uid() = user_id)
  OR 
  (
    -- Only allow access to ADIN profiles of users they're connected to
    EXISTS (
      SELECT 1 FROM public.connections c 
      WHERE c.status = 'accepted' 
      AND ((c.a = auth.uid() AND c.b = user_id) OR (c.a = user_id AND c.b = auth.uid()))
    )
  )
  OR
  public.is_admin_user(auth.uid())
);

-- Ensure admins can still manage profiles for legitimate administration
CREATE POLICY "Admins can view all profiles for administration" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin_user(auth.uid()));

COMMIT;