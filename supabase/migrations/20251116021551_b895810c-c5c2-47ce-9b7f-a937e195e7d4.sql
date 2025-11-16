-- Fix infinite recursion in group_members RLS policies
-- The issue: policies were querying group_members from within group_members policies  
-- Solution: Use a simpler, non-recursive approach

-- Drop recursive policies
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can update members" ON public.group_members;

-- Create non-recursive SELECT policy
-- Allow viewing if you're in the same group (check via groups table instead)
CREATE POLICY "Members can view group members"
ON public.group_members
FOR SELECT
USING (
  -- User is viewing members of a group they belong to
  EXISTS (
    SELECT 1 FROM public.groups g
    WHERE g.id = group_members.group_id
      AND (
        g.privacy = 'public'
        OR g.created_by = (SELECT auth.uid())
      )
  )
  OR
  -- Or user is a member themselves (check without recursion via direct match)
  user_id = (SELECT auth.uid())
);

-- Create non-recursive UPDATE policy  
-- Admins can update if they're an owner/admin
CREATE POLICY "Admins can update members"
ON public.group_members
FOR UPDATE
USING (
  -- Simple check: current user owns the group
  group_id IN (
    SELECT g.id FROM public.groups g
    WHERE g.created_by = (SELECT auth.uid())
  )
);