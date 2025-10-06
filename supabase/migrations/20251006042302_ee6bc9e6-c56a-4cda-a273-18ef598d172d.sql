-- CRITICAL SECURITY FIXES - PART 1: Remove dependencies then drop dangerous function
-- This migration removes the privilege escalation vulnerability

-- 1. DROP ALL POLICIES THAT DEPEND ON is_user_admin()
DROP POLICY IF EXISTS "Users can view and update their own signals" ON adin_signals;
DROP POLICY IF EXISTS "Admins can create invites or users with limits" ON invites;
DROP POLICY IF EXISTS "Posts SELECT policy" ON posts;
DROP POLICY IF EXISTS "Posts UPDATE policy" ON posts;
DROP POLICY IF EXISTS "Posts DELETE policy" ON posts;

-- 2. NOW DROP THE DANGEROUS FUNCTION (CASCADE not needed since we removed dependencies)
DROP FUNCTION IF EXISTS public.is_user_admin(uuid);

-- 3. REMOVE ROLE COLUMN FROM PROFILES (users must not control their own role)
ALTER TABLE profiles DROP COLUMN IF EXISTS role;

-- 4. DROP THE CONSTRAINT THAT REFERENCES THE REMOVED COLUMN
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_required_on_completion;

-- 5. RECREATE POLICIES USING SECURE has_role() FUNCTION

-- ADIN Signals policy - users see their own, admins see all
CREATE POLICY "Users can view and update their own signals"
ON adin_signals
FOR ALL
TO authenticated
USING (
  (user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)
);

-- Invites policy - only admins can create invites
CREATE POLICY "Admins can create invites"
ON invites
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Posts SELECT policy - public posts visible to all, private to author and admins
CREATE POLICY "Posts SELECT policy"
ON posts
FOR SELECT
TO authenticated
USING (
  visibility = 'public' OR 
  author_id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Posts UPDATE policy - only author or admin
CREATE POLICY "Posts UPDATE policy"
ON posts
FOR UPDATE
TO authenticated
USING (
  author_id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Posts DELETE policy - only author or admin
CREATE POLICY "Posts DELETE policy"
ON posts
FOR DELETE
TO authenticated
USING (
  author_id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- 6. FIX INVITE CODE EXPOSURE - Drop dangerous policies
DROP POLICY IF EXISTS "View invites policy" ON invites;
DROP POLICY IF EXISTS "Invites are viewable by user or admin" ON invites;

-- 7. CREATE SECURE INVITE VALIDATION FUNCTION
CREATE OR REPLACE FUNCTION public.validate_invite_code(invite_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_data record;
BEGIN
  SELECT * INTO invite_data 
  FROM invites 
  WHERE code = invite_code
    AND used_at IS NULL
    AND (expires_at IS NULL OR expires_at > now());

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false);
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'email', invite_data.email,
    'invite_id', invite_data.id
  );
END;
$$;

-- 8. GRANT EXECUTION TO ANON AND AUTHENTICATED
GRANT EXECUTE ON FUNCTION public.validate_invite_code(text) TO anon, authenticated;

-- 9. CREATE SECURE POLICIES FOR INVITES TABLE
-- Users can only see invites sent to their own email
CREATE POLICY "Users can view their own invites"
ON invites
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Admins can view all invites (using the secure has_role function)
CREATE POLICY "Admins can view all invites"
ON invites
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- 10. VERIFY USER_ROLES TABLE IS THE ONLY SOURCE OF ADMIN TRUTH
COMMENT ON TABLE user_roles IS 'CRITICAL: This is the ONLY source of truth for user roles. Never check roles from profiles table.';