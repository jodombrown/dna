-- Fix RLS performance issues by using (select auth.uid()) instead of auth.uid()

-- 1. Fix messages table policy
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
CREATE POLICY "Users can update messages in their conversations" ON public.messages
  FOR UPDATE 
  USING (EXISTS ( SELECT 1
     FROM conversations c
    WHERE ((c.id = messages.conversation_id) AND ((c.user_a = (select auth.uid())) OR (c.user_b = (select auth.uid()))))))
  WITH CHECK (EXISTS ( SELECT 1
     FROM conversations c
    WHERE ((c.id = messages.conversation_id) AND ((c.user_a = (select auth.uid())) OR (c.user_b = (select auth.uid()))))));

-- 2. Fix feedback_messages table policies (consolidate duplicates and fix auth.uid())
DROP POLICY IF EXISTS "Members can send messages" ON public.feedback_messages;
DROP POLICY IF EXISTS "Active members can send feedback messages" ON public.feedback_messages;

CREATE POLICY "Members can send feedback messages" ON public.feedback_messages
  FOR INSERT WITH CHECK (
    (sender_id = (select auth.uid())) AND 
    (EXISTS ( SELECT 1
       FROM feedback_channel_memberships
      WHERE ((feedback_channel_memberships.channel_id = feedback_messages.channel_id) 
        AND (feedback_channel_memberships.user_id = (select auth.uid())) 
        AND (feedback_channel_memberships.status = 'active'::text))))
  );

-- 3. Fix hashtag_followers table policies
DROP POLICY IF EXISTS "Users can follow hashtags" ON public.hashtag_followers;
CREATE POLICY "Users can follow hashtags" ON public.hashtag_followers
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can unfollow hashtags" ON public.hashtag_followers;
CREATE POLICY "Users can unfollow hashtags" ON public.hashtag_followers
  FOR DELETE USING (user_id = (select auth.uid()));

-- 4. Fix hashtag_usage_requests table policies
DROP POLICY IF EXISTS "Owners can update request status" ON public.hashtag_usage_requests;
CREATE POLICY "Owners can update request status" ON public.hashtag_usage_requests
  FOR UPDATE USING (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create requests" ON public.hashtag_usage_requests;
CREATE POLICY "Users can create requests" ON public.hashtag_usage_requests
  FOR INSERT WITH CHECK (requester_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own requests" ON public.hashtag_usage_requests;
CREATE POLICY "Users can view their own requests" ON public.hashtag_usage_requests
  FOR SELECT USING ((requester_id = (select auth.uid())) OR (owner_id = (select auth.uid())));