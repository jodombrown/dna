-- Fix infinite recursion in groups/group_members RLS policies
-- The issue is circular: groups_select checks group_members, group_members_select checks groups

-- First, create a helper function that bypasses RLS to check membership
CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = p_group_id 
    AND user_id = p_user_id 
    AND is_banned = false
  );
$$;

-- Create helper to check if user is group creator (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_group_creator(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM groups 
    WHERE id = p_group_id 
    AND created_by = p_user_id
  );
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "groups_select" ON groups;
DROP POLICY IF EXISTS "group_members_select" ON group_members;
DROP POLICY IF EXISTS "group_members_delete" ON group_members;
DROP POLICY IF EXISTS "group_members_update" ON group_members;

-- Recreate groups SELECT policy without circular reference
CREATE POLICY "groups_select_fixed" ON groups
  FOR SELECT USING (
    privacy <> 'secret'::group_privacy
    OR created_by = auth.uid()
    OR public.is_group_member(id, auth.uid())
  );

-- Recreate group_members SELECT policy without circular reference  
CREATE POLICY "group_members_select_fixed" ON group_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_group_creator(group_id, auth.uid())
  );

-- Recreate group_members DELETE policy without circular reference
CREATE POLICY "group_members_delete_fixed" ON group_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR public.is_group_creator(group_id, auth.uid())
  );

-- Recreate group_members UPDATE policy without circular reference
CREATE POLICY "group_members_update_fixed" ON group_members
  FOR UPDATE USING (
    public.is_group_creator(group_id, auth.uid())
  );