
-- Fix conversation_participants policy
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversation_participants;
CREATE POLICY "Users can view their conversations" ON public.conversation_participants
FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Fix groups update policy
DROP POLICY IF EXISTS "groups_update_fixed" ON public.groups;
CREATE POLICY "groups_update_fixed" ON public.groups
FOR UPDATE USING (created_by = (SELECT auth.uid()));

-- Fix group_members policies - drop and recreate with proper SELECT wrapper
DROP POLICY IF EXISTS "group_members_select" ON public.group_members;
CREATE POLICY "group_members_select" ON public.group_members
FOR SELECT USING (
  (user_id = (SELECT auth.uid())) 
  OR (EXISTS (
    SELECT 1 FROM groups g 
    WHERE g.id = group_members.group_id 
    AND g.created_by = (SELECT auth.uid())
  ))
);

DROP POLICY IF EXISTS "group_members_update" ON public.group_members;
CREATE POLICY "group_members_update" ON public.group_members
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM groups g 
    WHERE g.id = group_members.group_id 
    AND g.created_by = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "group_members_delete" ON public.group_members;
CREATE POLICY "group_members_delete" ON public.group_members
FOR DELETE USING (
  (user_id = (SELECT auth.uid())) 
  OR (EXISTS (
    SELECT 1 FROM groups g 
    WHERE g.id = group_members.group_id 
    AND g.created_by = (SELECT auth.uid())
  ))
);
