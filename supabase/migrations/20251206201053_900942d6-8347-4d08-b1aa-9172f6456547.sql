-- Fix infinite recursion in RLS policies
-- Drop the problematic policies first

-- 1. Fix conversation_participants - remove self-referencing policy
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;

-- Create a simpler policy that only checks if user is part of the conversation
CREATE POLICY "Users can view their conversations" 
ON conversation_participants FOR SELECT
USING (user_id = auth.uid());

-- 2. Fix groups and group_members circular dependency
-- Drop existing policies
DROP POLICY IF EXISTS "groups_update" ON groups;
DROP POLICY IF EXISTS "Members can view group memberships" ON group_members;
DROP POLICY IF EXISTS "Group creators can update members" ON group_members;
DROP POLICY IF EXISTS "Users can leave or creators can remove" ON group_members;

-- Recreate group_members policies without referencing groups
CREATE POLICY "group_members_select" 
ON group_members FOR SELECT
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM group_members gm2 
    WHERE gm2.group_id = group_members.group_id 
    AND gm2.user_id = auth.uid()
  )
);

CREATE POLICY "group_members_update" 
ON group_members FOR UPDATE
USING (
  -- Group owner can update any member (check via group_members role, not groups table)
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.role IN ('owner', 'admin')
  )
);

CREATE POLICY "group_members_delete" 
ON group_members FOR DELETE
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.role IN ('owner', 'admin')
  )
);

-- Recreate groups update policy without circular reference to group_members
CREATE POLICY "groups_update_fixed" 
ON groups FOR UPDATE
USING (
  created_by = auth.uid()
);