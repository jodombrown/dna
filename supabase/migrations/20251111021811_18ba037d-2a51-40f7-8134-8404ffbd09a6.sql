-- Fix auth_rls_initplan performance issues by wrapping auth functions in SELECT subqueries
-- This prevents unnecessary re-evaluation for each row

-- notifications table
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING ((select auth.uid()) = user_id);

-- beta_waitlist table
DROP POLICY IF EXISTS "Admins can delete waitlist entries" ON public.beta_waitlist;
CREATE POLICY "Admins can delete waitlist entries" ON public.beta_waitlist
FOR DELETE USING (has_role((select auth.uid()), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update waitlist entries" ON public.beta_waitlist;
CREATE POLICY "Admins can update waitlist entries" ON public.beta_waitlist
FOR UPDATE USING (has_role((select auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all waitlist entries" ON public.beta_waitlist;
CREATE POLICY "Admins can view all waitlist entries" ON public.beta_waitlist
FOR SELECT USING (has_role((select auth.uid()), 'admin'::app_role));

-- blocked_users table
DROP POLICY IF EXISTS "Users can create their own blocks" ON public.blocked_users;
CREATE POLICY "Users can create their own blocks" ON public.blocked_users
FOR INSERT WITH CHECK ((select auth.uid()) = blocker_id);

DROP POLICY IF EXISTS "Users can delete their own blocks" ON public.blocked_users;
CREATE POLICY "Users can delete their own blocks" ON public.blocked_users
FOR DELETE USING ((select auth.uid()) = blocker_id);

DROP POLICY IF EXISTS "Users can view their own blocks" ON public.blocked_users;
CREATE POLICY "Users can view their own blocks" ON public.blocked_users
FOR SELECT USING ((select auth.uid()) = blocker_id);

-- post_bookmarks table
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON public.post_bookmarks;
CREATE POLICY "Users can create their own bookmarks" ON public.post_bookmarks
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.post_bookmarks;
CREATE POLICY "Users can delete their own bookmarks" ON public.post_bookmarks
FOR DELETE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.post_bookmarks;
CREATE POLICY "Users can view their own bookmarks" ON public.post_bookmarks
FOR SELECT USING ((select auth.uid()) = user_id);

-- adin_preferences table
DROP POLICY IF EXISTS "Admins can view all ADIN preferences" ON public.adin_preferences;
CREATE POLICY "Admins can view all ADIN preferences" ON public.adin_preferences
FOR SELECT USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = (select auth.uid()) 
  AND profiles.email LIKE '%@diasporanetwork.africa'
));

DROP POLICY IF EXISTS "Users can insert own ADIN preferences" ON public.adin_preferences;
CREATE POLICY "Users can insert own ADIN preferences" ON public.adin_preferences
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own ADIN preferences" ON public.adin_preferences;
CREATE POLICY "Users can update own ADIN preferences" ON public.adin_preferences
FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own ADIN preferences" ON public.adin_preferences;
CREATE POLICY "Users can view own ADIN preferences" ON public.adin_preferences
FOR SELECT USING ((select auth.uid()) = user_id);

-- admin_activity_log table
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.admin_activity_log;
CREATE POLICY "Admins can view activity logs" ON public.admin_activity_log
FOR SELECT USING (has_role((select auth.uid()), 'admin'::app_role));

DROP POLICY IF EXISTS "System can insert activity logs" ON public.admin_activity_log;
CREATE POLICY "System can insert activity logs" ON public.admin_activity_log
FOR INSERT WITH CHECK ((select auth.uid()) = admin_id);

-- post_shares table
DROP POLICY IF EXISTS "Users can create their own shares" ON public.post_shares;
CREATE POLICY "Users can create their own shares" ON public.post_shares
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own shares" ON public.post_shares;
CREATE POLICY "Users can delete their own shares" ON public.post_shares
FOR DELETE USING ((select auth.uid()) = user_id);

-- post_hashtags table
DROP POLICY IF EXISTS "Post authors can add hashtags to their posts" ON public.post_hashtags;
CREATE POLICY "Post authors can add hashtags to their posts" ON public.post_hashtags
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = post_hashtags.post_id 
    AND posts.author_id = (select auth.uid())
  )
);