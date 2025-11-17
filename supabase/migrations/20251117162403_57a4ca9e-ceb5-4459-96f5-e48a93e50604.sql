-- Fix infinite recursion in group_members and events RLS policies
-- Strategy: Use security definer functions to break the recursion chain

-- Step 1: Create security definer helper functions with proper search_path
CREATE OR REPLACE FUNCTION public.user_is_group_member(p_user_id uuid, p_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = p_user_id
      AND group_id = p_group_id
      AND is_banned = false
  )
$$;

CREATE OR REPLACE FUNCTION public.user_group_role(p_user_id uuid, p_group_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.group_members
  WHERE user_id = p_user_id
    AND group_id = p_group_id
    AND is_banned = false
  LIMIT 1
$$;

-- Step 2: Drop and recreate group_members policies without recursion
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can update members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;

-- New simple policies for group_members (no self-reference)
CREATE POLICY "Users can view their own memberships"
ON public.group_members
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can view public group members"
ON public.group_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.groups g
    WHERE g.id = group_members.group_id
      AND g.privacy = 'public'
  )
);

CREATE POLICY "Group creators can view members"
ON public.group_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.groups g
    WHERE g.id = group_members.group_id
      AND g.created_by = auth.uid()
  )
);

CREATE POLICY "Allow users to join groups"
ON public.group_members
FOR INSERT
WITH CHECK (user_id = auth.uid() AND is_banned = false);

CREATE POLICY "Group creators can manage members"
ON public.group_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.groups g
    WHERE g.id = group_members.group_id
      AND g.created_by = auth.uid()
  )
);

CREATE POLICY "Allow users to leave groups"
ON public.group_members
FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Group creators can remove members"
ON public.group_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.groups g
    WHERE g.id = group_members.group_id
      AND g.created_by = auth.uid()
  )
);

-- Step 3: Drop and recreate events policies using the helper function
DROP POLICY IF EXISTS "Users can view accessible events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Organizers can update their events" ON public.events;
DROP POLICY IF EXISTS "Organizers can delete their own events" ON public.events;

-- New events policies using security definer function (breaks recursion)
CREATE POLICY "Users can view public events"
ON public.events
FOR SELECT
USING (
  is_public = true
  OR organizer_id = auth.uid()
);

CREATE POLICY "Users can view group events they have access to"
ON public.events
FOR SELECT
USING (
  group_id IS NOT NULL
  AND public.user_is_group_member(auth.uid(), group_id)
);

CREATE POLICY "Authenticated users can create events"
ON public.events
FOR INSERT
WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can update their own events"
ON public.events
FOR UPDATE
USING (organizer_id = auth.uid());

CREATE POLICY "Organizers can delete their own events"
ON public.events
FOR DELETE
USING (organizer_id = auth.uid());

-- Step 4: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.user_is_group_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_group_role(uuid, uuid) TO authenticated;