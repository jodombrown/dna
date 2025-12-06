-- Fix infinite recursion in group_members RLS policies
DROP POLICY IF EXISTS "group_members_select" ON group_members;
DROP POLICY IF EXISTS "group_members_update" ON group_members;
DROP POLICY IF EXISTS "group_members_delete" ON group_members;

-- Recreate without self-referencing subqueries (use groups table instead)
CREATE POLICY "group_members_select" ON group_members
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM groups g 
      WHERE g.id = group_members.group_id 
      AND g.created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_update" ON group_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM groups g 
      WHERE g.id = group_members.group_id 
      AND g.created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_delete" ON group_members
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM groups g 
      WHERE g.id = group_members.group_id 
      AND g.created_by = auth.uid()
    )
  );