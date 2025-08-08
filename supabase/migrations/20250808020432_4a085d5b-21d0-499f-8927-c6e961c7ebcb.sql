-- 1) Protect privileged profile fields (role) from non-admin updates
CREATE OR REPLACE FUNCTION public.prevent_non_admin_profile_privilege_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can change privileged profile fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_privileges ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileges
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_non_admin_profile_privilege_updates();

-- 2) Replace is_user_admin() usage in RLS with is_admin_user() and fix auth.uid() initplan pattern for the updated policies
-- Comments: delete policy
DROP POLICY IF EXISTS "Users can delete their own comments or admins can delete any" ON public.comments;
CREATE POLICY "Users can delete their own comments or admins can delete any"
ON public.comments
FOR DELETE
USING ((author_id = (SELECT auth.uid())) OR is_admin_user((SELECT auth.uid())));

-- Communities: delete policy
DROP POLICY IF EXISTS "Users can delete own communities or admins can delete any" ON public.communities;
CREATE POLICY "Users can delete own communities or admins can delete any"
ON public.communities
FOR DELETE
USING ((created_by = (SELECT auth.uid())) OR is_admin_user((SELECT auth.uid())));

-- Content moderation: admin-only access
DROP POLICY IF EXISTS "Only admins can access content moderation" ON public.content_moderation;
CREATE POLICY "Only admins can access content moderation"
ON public.content_moderation
FOR ALL
USING (is_admin_user((SELECT auth.uid())))
WITH CHECK (is_admin_user((SELECT auth.uid())));

-- Also update a couple of communities policies to use (SELECT auth.uid()) pattern
DROP POLICY IF EXISTS "Users can update own communities" ON public.communities;
CREATE POLICY "Users can update own communities"
ON public.communities
FOR UPDATE
USING ((SELECT auth.uid()) = created_by);

DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;
CREATE POLICY "Authenticated users can create communities"
ON public.communities
FOR INSERT
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- 3) Consolidate impact_badges policies to avoid multiple permissive SELECT policies
-- Drop the broad ALL policy and recreate write-specific policies for admins only
DROP POLICY IF EXISTS "Admins can manage badges" ON public.impact_badges;

CREATE POLICY "Admins can insert badges"
ON public.impact_badges
FOR INSERT
WITH CHECK (is_admin_user((SELECT auth.uid())));

CREATE POLICY "Admins can update badges"
ON public.impact_badges
FOR UPDATE
USING (is_admin_user((SELECT auth.uid())))
WITH CHECK (is_admin_user((SELECT auth.uid())));

CREATE POLICY "Admins can delete badges"
ON public.impact_badges
FOR DELETE
USING (is_admin_user((SELECT auth.uid())));

-- Ensure the public read policy exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'impact_badges' AND polname = 'Badges are viewable by everyone'
  ) THEN
    CREATE POLICY "Badges are viewable by everyone"
    ON public.impact_badges
    FOR SELECT
    USING (true);
  END IF;
END$$;

-- 4) Clean up duplicate/overlapping policies on user_badges if present
DROP POLICY IF EXISTS "System can create badges" ON public.user_badges;
DROP POLICY IF EXISTS "Users can view badges" ON public.user_badges;

-- Ensure minimal sane policies exist (idempotent guards)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_badges' AND polname = 'Users can view their own badges'
  ) THEN
    CREATE POLICY "Users can view their own badges"
    ON public.user_badges
    FOR SELECT
    USING (user_id = (SELECT auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_badges' AND polname = 'System can insert user badges'
  ) THEN
    CREATE POLICY "System can insert user badges"
    ON public.user_badges
    FOR INSERT
    WITH CHECK (true);
  END IF;
END$$;

-- 5) Drop duplicate indexes reported by linter (keep one of each)
DROP INDEX IF EXISTS public.idx_ms_space;
DROP INDEX IF EXISTS public.idx_opps_space;
DROP INDEX IF EXISTS public.idx_user_contributions_user;