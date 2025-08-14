-- Fix critical security issue: Secure public_profile view and other exposed views
-- This prevents unauthorized access to user personal information

-- Drop the insecure public_profile view
DROP VIEW IF EXISTS public.public_profile;

-- Create a secure function to get public profiles with proper access controls
CREATE OR REPLACE FUNCTION public.get_public_profiles(
  p_user_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  headline text,
  location text,
  org text,
  links jsonb,
  skills text[],
  bio text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_viewer uuid := (SELECT auth.uid());
BEGIN
  -- If specific user requested, check if profile should be visible
  IF p_user_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.username,
      CASE WHEN public.can_view_field(p.visibility, 'display_name', v_viewer, p.id) THEN p.display_name ELSE NULL END,
      p.avatar_url,
      CASE WHEN public.can_view_field(p.visibility, 'headline', v_viewer, p.id) THEN p.headline ELSE NULL END,
      CASE WHEN public.can_view_field(p.visibility, 'location', v_viewer, p.id) THEN p.location ELSE NULL END,
      CASE WHEN public.can_view_field(p.visibility, 'company', v_viewer, p.id) THEN p.company ELSE NULL END,
      CASE WHEN public.can_view_field(p.visibility, 'links', v_viewer, p.id) 
           THEN jsonb_strip_nulls(jsonb_build_object('linkedin', p.linkedin_url, 'website', p.website_url)) 
           ELSE NULL END,
      CASE WHEN public.can_view_field(p.visibility, 'skills', v_viewer, p.id) THEN COALESCE(p.skills, ARRAY[]::text[]) ELSE NULL END,
      CASE WHEN public.can_view_field(p.visibility, 'bio', v_viewer, p.id) THEN p.bio ELSE NULL END
    FROM profiles p
    WHERE p.id = p_user_id 
      AND COALESCE(p.is_public, false) = true
      AND COALESCE(p.profile_completeness_score, 0) >= 50;
  ELSE
    -- Return list of public profiles with privacy controls
    RETURN QUERY
    SELECT 
      p.id,
      p.username,
      CASE WHEN public.can_view_field(p.visibility, 'display_name', v_viewer, p.id) THEN p.display_name ELSE NULL END,
      p.avatar_url,
      CASE WHEN public.can_view_field(p.visibility, 'headline', v_viewer, p.id) THEN p.headline ELSE NULL END,
      CASE WHEN public.can_view_field(p.visibility, 'location', v_viewer, p.id) THEN p.location ELSE NULL END,
      CASE WHEN public.can_view_field(p.visibility, 'company', v_viewer, p.id) THEN p.company ELSE NULL END,
      CASE WHEN public.can_view_field(p.visibility, 'links', v_viewer, p.id) 
           THEN jsonb_strip_nulls(jsonb_build_object('linkedin', p.linkedin_url, 'website', p.website_url)) 
           ELSE NULL END,
      CASE WHEN public.can_view_field(p.visibility, 'skills', v_viewer, p.id) THEN COALESCE(p.skills, ARRAY[]::text[]) ELSE NULL END,
      CASE WHEN public.can_view_field(p.visibility, 'bio', v_viewer, p.id) THEN p.bio ELSE NULL END
    FROM profiles p
    WHERE COALESCE(p.is_public, false) = true
      AND COALESCE(p.profile_completeness_score, 0) >= 50
    ORDER BY p.created_at DESC
    LIMIT GREATEST(COALESCE(p_limit, 50), 1);
  END IF;
END;
$$;

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_public_profiles TO authenticated;

-- Secure the v_feed_ordered view by ensuring RLS is properly applied
DROP VIEW IF EXISTS public.v_feed_ordered;

CREATE VIEW public.v_feed_ordered
WITH (security_invoker = true)
AS SELECT 
  id,
  author_id,
  content,
  media_url,
  pillar,
  hashtags,
  visibility,
  created_at,
  updated_at,
  type,
  user_id,
  shared_post_id,
  embed_metadata,
  status,
  poll_options,
  poll_expires_at,
  link_url,
  link_metadata,
  opportunity_type,
  opportunity_link,
  spotlight
FROM posts p
WHERE visibility = 'public' OR author_id = (SELECT auth.uid())
ORDER BY spotlight DESC, created_at DESC;

-- Ensure proper RLS is enabled on the profiles table if not already
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Profiles privacy policy') THEN
    CREATE POLICY "Profiles privacy policy" 
    ON public.profiles 
    FOR SELECT 
    USING (
      -- Users can always see their own profile
      id = (SELECT auth.uid()) 
      OR 
      -- Public profiles with sufficient completeness can be seen by authenticated users
      (COALESCE(is_public, false) = true AND COALESCE(profile_completeness_score, 0) >= 50)
    );
  END IF;
END $$;

-- Add comment explaining the security improvement
COMMENT ON FUNCTION public.get_public_profiles IS 'Secure function to get public profiles with proper privacy controls. Replaces the insecure public_profile view.';