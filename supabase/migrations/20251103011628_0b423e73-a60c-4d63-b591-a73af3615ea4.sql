-- 🔴 CRITICAL FIX: Broken RLS Policies in Groups System
-- These policies have incorrect column references causing security vulnerabilities

-- Issue #1: Fix Groups UPDATE policy
DROP POLICY IF EXISTS "Admins can update groups" ON groups;
CREATE POLICY "Admins can update groups" ON groups
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = groups.id
      AND group_members.user_id = (select auth.uid())
      AND group_members.role IN ('owner', 'admin')
      AND group_members.is_banned = false
  )
);

-- Issue #4: Fix Secret Groups SELECT policy
DROP POLICY IF EXISTS "Members can view secret groups" ON groups;
CREATE POLICY "Members can view secret groups" ON groups
FOR SELECT
USING (
  privacy = 'secret'
  AND EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = groups.id
      AND group_members.user_id = (select auth.uid())
      AND group_members.is_banned = false
  )
);

-- Issue #5: Fix Private Groups SELECT policy
DROP POLICY IF EXISTS "Members can view their private groups" ON groups;
CREATE POLICY "Members can view their private groups" ON groups
FOR SELECT
USING (
  privacy = 'private'
  AND EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = groups.id
      AND group_members.user_id = (select auth.uid())
      AND group_members.is_banned = false
  )
);

-- Issue #7: Fix banned users viewing posts
DROP POLICY IF EXISTS "Members can view group posts" ON group_posts;
CREATE POLICY "Members can view group posts" ON group_posts
FOR SELECT
USING (
  is_deleted = false
  AND EXISTS (
    SELECT 1 FROM groups g
    LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = (select auth.uid())
    WHERE g.id = group_posts.group_id
      AND (
        g.privacy = 'public'
        OR (gm.user_id IS NOT NULL AND gm.is_banned = false)
      )
  )
);

-- Fix: Add search_path to update_group_member_count function
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$function$;