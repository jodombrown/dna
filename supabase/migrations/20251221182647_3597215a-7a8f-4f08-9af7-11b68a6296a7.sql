-- =============================================
-- FIX auth_rls_initplan WARNINGS
-- Convert auth.uid() to (select auth.uid())
-- =============================================

-- 1. messages table
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
CREATE POLICY "Users can delete their own messages" ON public.messages
  FOR DELETE USING (sender_id = (select auth.uid()));

-- 2. post_reactions table
DROP POLICY IF EXISTS "Users can add their own reactions" ON public.post_reactions;
CREATE POLICY "Users can add their own reactions" ON public.post_reactions
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

-- 3. feedback_channel_memberships table
DROP POLICY IF EXISTS "Users can view their own membership" ON public.feedback_channel_memberships;
CREATE POLICY "Users can view their own membership" ON public.feedback_channel_memberships
  FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own membership" ON public.feedback_channel_memberships;
CREATE POLICY "Users can insert their own membership" ON public.feedback_channel_memberships
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own membership" ON public.feedback_channel_memberships;
CREATE POLICY "Users can update their own membership" ON public.feedback_channel_memberships
  FOR UPDATE USING (user_id = (select auth.uid()));

-- 4. groups table
DROP POLICY IF EXISTS "groups_select_fixed" ON public.groups;
CREATE POLICY "groups_select_fixed" ON public.groups
  FOR SELECT USING (
    (privacy <> 'secret'::group_privacy) 
    OR (created_by = (select auth.uid()))
    OR is_group_member(id, (select auth.uid()))
  );

-- 5. group_members table
DROP POLICY IF EXISTS "group_members_select_fixed" ON public.group_members;
CREATE POLICY "group_members_select_fixed" ON public.group_members
  FOR SELECT USING (
    (user_id = (select auth.uid())) 
    OR is_group_creator(group_id, (select auth.uid()))
  );

DROP POLICY IF EXISTS "group_members_delete_fixed" ON public.group_members;
CREATE POLICY "group_members_delete_fixed" ON public.group_members
  FOR DELETE USING (
    (user_id = (select auth.uid())) 
    OR is_group_creator(group_id, (select auth.uid()))
  );

DROP POLICY IF EXISTS "group_members_update_fixed" ON public.group_members;
CREATE POLICY "group_members_update_fixed" ON public.group_members
  FOR UPDATE USING (
    is_group_creator(group_id, (select auth.uid()))
  );

-- 6. feedback_messages table (uses sender_id, not author_id)
DROP POLICY IF EXISTS "Active members can view feedback messages" ON public.feedback_messages;
CREATE POLICY "Active members can view feedback messages" ON public.feedback_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.feedback_channel_memberships
      WHERE feedback_channel_memberships.channel_id = feedback_messages.channel_id
      AND feedback_channel_memberships.user_id = (select auth.uid())
      AND feedback_channel_memberships.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Active members can send feedback messages" ON public.feedback_messages;
CREATE POLICY "Active members can send feedback messages" ON public.feedback_messages
  FOR INSERT WITH CHECK (
    sender_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.feedback_channel_memberships
      WHERE feedback_channel_memberships.channel_id = feedback_messages.channel_id
      AND feedback_channel_memberships.user_id = (select auth.uid())
      AND feedback_channel_memberships.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can update their own messages" ON public.feedback_messages;
CREATE POLICY "Users can update their own messages" ON public.feedback_messages
  FOR UPDATE USING (sender_id = (select auth.uid()));

-- 7. feedback_attachments table
DROP POLICY IF EXISTS "Members can view attachments" ON public.feedback_attachments;
CREATE POLICY "Members can view attachments" ON public.feedback_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.feedback_messages m
      JOIN public.feedback_channel_memberships mem ON mem.channel_id = m.channel_id
      WHERE m.id = feedback_attachments.message_id
      AND mem.user_id = (select auth.uid())
      AND mem.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Members can upload attachments" ON public.feedback_attachments;
CREATE POLICY "Members can upload attachments" ON public.feedback_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.feedback_messages m
      WHERE m.id = feedback_attachments.message_id
      AND m.sender_id = (select auth.uid())
    )
  );

-- 8. feedback_reactions table
DROP POLICY IF EXISTS "Members can view reactions" ON public.feedback_reactions;
CREATE POLICY "Members can view reactions" ON public.feedback_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.feedback_messages m
      JOIN public.feedback_channel_memberships mem ON mem.channel_id = m.channel_id
      WHERE m.id = feedback_reactions.message_id
      AND mem.user_id = (select auth.uid())
      AND mem.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can add reactions" ON public.feedback_reactions;
CREATE POLICY "Users can add reactions" ON public.feedback_reactions
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can remove their own reactions" ON public.feedback_reactions;
CREATE POLICY "Users can remove their own reactions" ON public.feedback_reactions
  FOR DELETE USING (user_id = (select auth.uid()));

-- =============================================
-- FIX multiple_permissive_policies WARNINGS
-- Consolidate duplicate policies
-- =============================================

-- 1. countries table - drop duplicate, keep "Public can read countries"
DROP POLICY IF EXISTS "Countries are viewable by everyone" ON public.countries;

-- 2. regions table - drop duplicate, keep "Public can read regions"
DROP POLICY IF EXISTS "Regions are viewable by everyone" ON public.regions;

-- 3. feedback_channel_memberships - merge SELECT policies
DROP POLICY IF EXISTS "Admins can view all memberships" ON public.feedback_channel_memberships;
DROP POLICY IF EXISTS "Users can view their own membership" ON public.feedback_channel_memberships;
CREATE POLICY "View channel memberships" ON public.feedback_channel_memberships
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR has_role((select auth.uid()), 'admin'::app_role)
  );

-- 4. feedback_messages - merge UPDATE policies
DROP POLICY IF EXISTS "Admins can update any feedback message" ON public.feedback_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.feedback_messages;
CREATE POLICY "Update feedback messages" ON public.feedback_messages
  FOR UPDATE USING (
    sender_id = (select auth.uid())
    OR is_feedback_admin()
  );