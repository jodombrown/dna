-- Fix Critical RLS Security Issues

-- Issue #1: Fix broken UPDATE policy on groups table
DROP POLICY IF EXISTS "Group admins can update group details" ON groups;
CREATE POLICY "Group admins can update group details" 
ON groups FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = groups.id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('owner', 'admin')
      AND gm.is_banned = false
  )
);

-- Issue #4 & #5: Fix broken SELECT policies for secret and private groups
DROP POLICY IF EXISTS "Secret groups are only visible to members" ON groups;
CREATE POLICY "Secret groups are only visible to members" 
ON groups FOR SELECT 
USING (
  privacy = 'public' OR
  privacy = 'private' OR
  (privacy = 'secret' AND EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = groups.id
      AND gm.user_id = auth.uid()
      AND gm.is_banned = false
  ))
);

-- Issue #3: Fix broken UPDATE policy on group_join_requests
DROP POLICY IF EXISTS "Group admins can approve/reject join requests" ON group_join_requests;
CREATE POLICY "Group admins can approve/reject join requests" 
ON group_join_requests FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_join_requests.group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('owner', 'admin', 'moderator')
      AND gm.is_banned = false
  )
);

-- Issue #7: Fix group_posts SELECT policy to exclude banned users
DROP POLICY IF EXISTS "Group members can view posts" ON group_posts;
CREATE POLICY "Group members can view posts" 
ON group_posts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_posts.group_id
      AND gm.user_id = auth.uid()
      AND gm.is_banned = false
  ) OR
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_posts.group_id
      AND g.privacy = 'public'
  )
);

-- Issue #8: Ensure sensitive profile data is not publicly exposed
-- Update profiles RLS to restrict sensitive fields
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (
  is_public = true OR
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM connections c
    WHERE ((c.requester_id = auth.uid() AND c.recipient_id = profiles.id)
       OR (c.recipient_id = auth.uid() AND c.requester_id = profiles.id))
      AND c.status = 'accepted'
  )
);