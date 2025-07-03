
-- Fix RLS performance issues by optimizing auth.uid() calls
-- Replace auth.uid() with (select auth.uid()) to prevent re-evaluation for each row

-- Fix messages table policies
DROP POLICY IF EXISTS "Users can update messages they sent" ON public.messages;
CREATE POLICY "Users can update messages they sent" 
  ON public.messages 
  FOR UPDATE 
  USING ((select auth.uid()) = sender_id);

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" 
  ON public.messages 
  FOR SELECT 
  USING (
    ((conversation_id IS NOT NULL) AND (EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.user_1_id = (select auth.uid()) OR conversations.user_2_id = (select auth.uid()))
    ))) OR
    ((group_conversation_id IS NOT NULL) AND (EXISTS (
      SELECT 1 FROM public.group_conversation_members 
      WHERE group_conversation_members.group_conversation_id = messages.group_conversation_id 
      AND group_conversation_members.user_id = (select auth.uid())
    )))
  );

DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
CREATE POLICY "Users can create messages in their conversations" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    (select auth.uid()) = sender_id AND (
      ((conversation_id IS NOT NULL) AND (EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE conversations.id = messages.conversation_id 
        AND (conversations.user_1_id = (select auth.uid()) OR conversations.user_2_id = (select auth.uid()))
      ))) OR
      ((group_conversation_id IS NOT NULL) AND (EXISTS (
        SELECT 1 FROM public.group_conversation_members 
        WHERE group_conversation_members.group_conversation_id = messages.group_conversation_id 
        AND group_conversation_members.user_id = (select auth.uid())
      )))
    )
  );

-- Fix contact_requests table policies
DROP POLICY IF EXISTS "Users can view requests they sent or received" ON public.contact_requests;
CREATE POLICY "Users can view requests they sent or received" 
  ON public.contact_requests 
  FOR SELECT 
  USING (((select auth.uid()) = sender_id) OR ((select auth.uid()) = receiver_id));

DROP POLICY IF EXISTS "Users can create contact requests" ON public.contact_requests;
CREATE POLICY "Users can create contact requests" 
  ON public.contact_requests 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = sender_id);

DROP POLICY IF EXISTS "Users can update requests they received" ON public.contact_requests;
CREATE POLICY "Users can update requests they received" 
  ON public.contact_requests 
  FOR UPDATE 
  USING ((select auth.uid()) = receiver_id);

-- Fix follows table policies
DROP POLICY IF EXISTS "Users can create their own follows" ON public.follows;
CREATE POLICY "Users can create their own follows" 
  ON public.follows 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = follower_id);

DROP POLICY IF EXISTS "Users can delete their own follows" ON public.follows;
CREATE POLICY "Users can delete their own follows" 
  ON public.follows 
  FOR DELETE 
  USING ((select auth.uid()) = follower_id);

-- Fix notifications table policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING ((select auth.uid()) = recipient_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING ((select auth.uid()) = recipient_id);

-- Fix group_conversations table policies
DROP POLICY IF EXISTS "Users can view group conversations they are members of" ON public.group_conversations;
CREATE POLICY "Users can view group conversations they are members of" 
  ON public.group_conversations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_conversation_members 
      WHERE group_conversation_members.group_conversation_id = group_conversations.id 
      AND group_conversation_members.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create group conversations" ON public.group_conversations;
CREATE POLICY "Users can create group conversations" 
  ON public.group_conversations 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Group admins can update conversations" ON public.group_conversations;
CREATE POLICY "Group admins can update conversations" 
  ON public.group_conversations 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_conversation_members 
      WHERE group_conversation_members.group_conversation_id = group_conversations.id 
      AND group_conversation_members.user_id = (select auth.uid()) 
      AND group_conversation_members.role = 'admin'
    )
  );

-- Fix group_conversation_members table policies
DROP POLICY IF EXISTS "Users can view group members if they are members" ON public.group_conversation_members;
CREATE POLICY "Users can view group members if they are members" 
  ON public.group_conversation_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_conversation_members gcm 
      WHERE gcm.group_conversation_id = group_conversation_members.group_conversation_id 
      AND gcm.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Group admins can add members" ON public.group_conversation_members;
CREATE POLICY "Group admins can add members" 
  ON public.group_conversation_members 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_conversation_members 
      WHERE group_conversation_id = group_conversation_members.group_conversation_id 
      AND user_id = (select auth.uid()) 
      AND role = 'admin'
    ) OR (select auth.uid()) = user_id
  );

DROP POLICY IF EXISTS "Users can leave groups or admins can remove members" ON public.group_conversation_members;
CREATE POLICY "Users can leave groups or admins can remove members" 
  ON public.group_conversation_members 
  FOR DELETE 
  USING (
    (select auth.uid()) = user_id OR 
    EXISTS (
      SELECT 1 FROM public.group_conversation_members 
      WHERE group_conversation_id = group_conversation_members.group_conversation_id 
      AND user_id = (select auth.uid()) 
      AND role = 'admin'
    )
  );

-- Fix saved_items table policies
DROP POLICY IF EXISTS "Users can view their own saved items" ON public.saved_items;
CREATE POLICY "Users can view their own saved items" 
  ON public.saved_items 
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own saved items" ON public.saved_items;
CREATE POLICY "Users can create their own saved items" 
  ON public.saved_items 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved items" ON public.saved_items;
CREATE POLICY "Users can delete their own saved items" 
  ON public.saved_items 
  FOR DELETE 
  USING ((select auth.uid()) = user_id);

-- Fix community_memberships table policies
DROP POLICY IF EXISTS "Users can create their own memberships" ON public.community_memberships;
CREATE POLICY "Users can create their own memberships" 
  ON public.community_memberships 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own memberships" ON public.community_memberships;
CREATE POLICY "Users can delete their own memberships" 
  ON public.community_memberships 
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can remove their own memberships" ON public.community_memberships;
CREATE POLICY "Users can remove their own memberships" 
  ON public.community_memberships 
  FOR DELETE 
  USING ((select auth.uid()) = user_id);

-- Fix message_read_receipts table policies
DROP POLICY IF EXISTS "Users can view read receipts for their messages or conversation" ON public.message_read_receipts;
CREATE POLICY "Users can view read receipts for their messages or conversation" 
  ON public.message_read_receipts 
  FOR SELECT 
  USING (
    (select auth.uid()) = user_id OR 
    EXISTS (
      SELECT 1 FROM public.messages m 
      WHERE m.id = message_read_receipts.message_id 
      AND (
        m.sender_id = (select auth.uid()) OR
        EXISTS (
          SELECT 1 FROM public.conversations c 
          WHERE c.id = m.conversation_id 
          AND (c.user_1_id = (select auth.uid()) OR c.user_2_id = (select auth.uid()))
        ) OR
        EXISTS (
          SELECT 1 FROM public.group_conversation_members gcm 
          WHERE gcm.group_conversation_id = m.group_conversation_id 
          AND gcm.user_id = (select auth.uid())
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can create their own read receipts" ON public.message_read_receipts;
CREATE POLICY "Users can create their own read receipts" 
  ON public.message_read_receipts 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix contributions table policies (also consolidate multiple permissive policies)
DROP POLICY IF EXISTS "Public contributions viewable" ON public.contributions;
DROP POLICY IF EXISTS "Users can view their own contributions" ON public.contributions;
CREATE POLICY "Users can view contributions" 
  ON public.contributions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = contributions.user_id 
      AND profiles.is_public = true
    ) OR (select auth.uid()) = user_id
  );

-- Fix job_posts table policies
DROP POLICY IF EXISTS "Authenticated users can create job posts" ON public.job_posts;
CREATE POLICY "Authenticated users can create job posts" 
  ON public.job_posts 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = posted_by);

DROP POLICY IF EXISTS "Users can update their own job posts" ON public.job_posts;
CREATE POLICY "Users can update their own job posts" 
  ON public.job_posts 
  FOR UPDATE 
  USING ((select auth.uid()) = posted_by);

DROP POLICY IF EXISTS "Users can delete their own job posts" ON public.job_posts;
CREATE POLICY "Users can delete their own job posts" 
  ON public.job_posts 
  FOR DELETE 
  USING ((select auth.uid()) = posted_by);

-- Fix job_referrals table policies
DROP POLICY IF EXISTS "Users can view referrals they made or received" ON public.job_referrals;
CREATE POLICY "Users can view referrals they made or received" 
  ON public.job_referrals 
  FOR SELECT 
  USING (((select auth.uid()) = referrer_id) OR ((select auth.uid()) = referred_id));

DROP POLICY IF EXISTS "Users can create referrals" ON public.job_referrals;
CREATE POLICY "Users can create referrals" 
  ON public.job_referrals 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = referrer_id);

DROP POLICY IF EXISTS "Users can update referrals they made" ON public.job_referrals;
CREATE POLICY "Users can update referrals they made" 
  ON public.job_referrals 
  FOR UPDATE 
  USING ((select auth.uid()) = referrer_id);

-- Fix conversations table policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (((select auth.uid()) = user_1_id) OR ((select auth.uid()) = user_2_id));

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (((select auth.uid()) = user_1_id) OR ((select auth.uid()) = user_2_id));

DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
CREATE POLICY "Users can update their own conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (((select auth.uid()) = user_1_id) OR ((select auth.uid()) = user_2_id));
