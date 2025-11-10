-- Fix all broken policies with correct column names

-- Fix events policy
DROP POLICY IF EXISTS "Users can view accessible events" ON public.events;
CREATE POLICY "Users can view accessible events" 
ON public.events 
FOR SELECT 
USING (
  is_public = true
  OR organizer_id = (SELECT auth.uid())
);

-- Fix profiles policy  
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (
  account_visibility = 'public' 
  OR id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM connections 
    WHERE (
      (requester_id = (SELECT auth.uid()) AND recipient_id = profiles.id)
      OR (recipient_id = (SELECT auth.uid()) AND requester_id = profiles.id)
    )
    AND status = 'accepted'
  )
);

-- Fix groups policy (no status column in group_members)
DROP POLICY IF EXISTS "Secret groups are only visible to members" ON public.groups;
CREATE POLICY "Secret groups are only visible to members" 
ON public.groups 
FOR SELECT 
USING (
  privacy != 'secret' 
  OR EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = (SELECT auth.uid())
    AND group_members.is_banned = false
  )
);

-- Fix group posts policy (remove status check)
DROP POLICY IF EXISTS "Group members can view posts" ON public.group_posts;
CREATE POLICY "Group members can view posts" 
ON public.group_posts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM group_members gm 
  WHERE gm.group_id = group_posts.group_id 
  AND gm.user_id = (SELECT auth.uid())
  AND gm.is_banned = false
));

-- Fix group admins policy (remove status check)
DROP POLICY IF EXISTS "Group admins can update group details" ON public.groups;
CREATE POLICY "Group admins can update group details" 
ON public.groups 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM group_members 
  WHERE group_members.group_id = groups.id 
  AND group_members.user_id = (SELECT auth.uid()) 
  AND group_members.role IN ('admin', 'owner')
  AND group_members.is_banned = false
));

-- Fix group_join_requests policy (remove status check)
DROP POLICY IF EXISTS "Group admins can approve/reject join requests" ON public.group_join_requests;
CREATE POLICY "Group admins can approve/reject join requests" 
ON public.group_join_requests 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM group_members 
  WHERE group_members.group_id = group_join_requests.group_id 
  AND group_members.user_id = (SELECT auth.uid()) 
  AND group_members.role IN ('admin', 'owner')
  AND group_members.is_banned = false
));