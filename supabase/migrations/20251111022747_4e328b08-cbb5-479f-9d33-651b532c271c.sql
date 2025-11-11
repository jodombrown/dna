-- COMPREHENSIVE FIX: Remove all duplicate RLS policies
-- Based on actual policy names from pg_policies

-- ============ ADIN_PREFERENCES ============
-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Admins can view all ADIN preferences" ON public.adin_preferences;
DROP POLICY IF EXISTS "Users can view ADIN preferences" ON public.adin_preferences;
DROP POLICY IF EXISTS "Users can view own ADIN preferences" ON public.adin_preferences;

-- Create single consolidated SELECT policy
CREATE POLICY "adin_preferences_select" ON public.adin_preferences
FOR SELECT USING (
  (select auth.uid()) = user_id 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (select auth.uid()) 
    AND profiles.email LIKE '%@diasporanetwork.africa'
  )
);

-- ============ GROUP_JOIN_REQUESTS ============
-- Drop all existing UPDATE policies
DROP POLICY IF EXISTS "Admins can update join requests" ON public.group_join_requests;
DROP POLICY IF EXISTS "Group admins can approve/reject join requests" ON public.group_join_requests;

-- Create single consolidated UPDATE policy (using group_members not group_memberships)
CREATE POLICY "group_join_requests_update" ON public.group_join_requests
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_join_requests.group_id
    AND gm.user_id = (select auth.uid())
    AND gm.role = ANY(ARRAY['owner'::group_member_role, 'admin'::group_member_role])
    AND gm.is_banned = false
  )
);

-- ============ GROUP_POSTS ============
-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Group members can view posts" ON public.group_posts;
DROP POLICY IF EXISTS "Members can view group posts" ON public.group_posts;

-- Create single consolidated SELECT policy
CREATE POLICY "group_posts_select" ON public.group_posts
FOR SELECT USING (
  is_deleted = false 
  AND EXISTS (
    SELECT 1 FROM groups g
    LEFT JOIN group_members gm ON (gm.group_id = g.id AND gm.user_id = (select auth.uid()))
    WHERE g.id = group_posts.group_id
    AND (g.privacy = 'public'::group_privacy OR (gm.user_id IS NOT NULL AND gm.is_banned = false))
  )
);

-- ============ GROUPS ============
-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Secret groups are only visible to members" ON public.groups;
DROP POLICY IF EXISTS "Users can view accessible groups" ON public.groups;

-- Create single consolidated SELECT policy
CREATE POLICY "groups_select" ON public.groups
FOR SELECT USING (
  privacy != 'secret'::group_privacy
  OR EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = groups.id
    AND gm.user_id = (select auth.uid())
    AND gm.is_banned = false
  )
);

-- Drop all existing UPDATE policies
DROP POLICY IF EXISTS "Admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update group details" ON public.groups;

-- Create single consolidated UPDATE policy  
CREATE POLICY "groups_update" ON public.groups
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = groups.id
    AND gm.user_id = (select auth.uid())
    AND gm.role = ANY(ARRAY['owner'::group_member_role, 'admin'::group_member_role])
    AND gm.is_banned = false
  )
);

-- ============ NOTIFICATIONS ============
-- Drop all existing INSERT policies
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create single consolidated INSERT policy
CREATE POLICY "notifications_insert" ON public.notifications
FOR INSERT WITH CHECK (true);

-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;

-- Create single consolidated SELECT policy
CREATE POLICY "notifications_select" ON public.notifications
FOR SELECT USING ((select auth.uid()) = user_id);

-- Drop all existing UPDATE policies
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

-- Create single consolidated UPDATE policy
CREATE POLICY "notifications_update" ON public.notifications
FOR UPDATE USING ((select auth.uid()) = user_id);

-- ============ PROFILES ============
-- Drop all existing INSERT policies
DROP POLICY IF EXISTS "System can create profiles for new users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create single consolidated INSERT policy
CREATE POLICY "profiles_insert" ON public.profiles
FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile during onboarding" ON public.profiles;

-- Create single consolidated SELECT policy
CREATE POLICY "profiles_select" ON public.profiles
FOR SELECT USING (
  is_public = true 
  OR (select auth.uid()) = id
);