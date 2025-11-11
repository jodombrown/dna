-- Complete consolidation of all duplicate RLS policies
-- Fixed to work with actual database schema

-- ============ BETA_WAITLIST ============
DROP POLICY IF EXISTS "Admins can view all waitlist entries" ON public.beta_waitlist;
DROP POLICY IF EXISTS "Users can view own waitlist entry" ON public.beta_waitlist;
CREATE POLICY "Users can view waitlist entries" ON public.beta_waitlist
FOR SELECT USING (
  has_role((select auth.uid()), 'admin'::app_role)
  OR (email = (select auth.email()))
);

-- ============ ADIN_PREFERENCES ============  
DROP POLICY IF EXISTS "Users can view ADIN preferences" ON public.adin_preferences;
CREATE POLICY "Users can view ADIN preferences" ON public.adin_preferences
FOR SELECT USING (
  (select auth.uid()) = user_id 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (select auth.uid()) 
    AND profiles.email LIKE '%@diasporanetwork.africa'
  )
);

-- ============ NOTIFICATIONS ============
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING ((select auth.uid()) = user_id);

-- ============ PROFILES ============
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Profiles are viewable" ON public.profiles;
CREATE POLICY "Profiles are viewable" ON public.profiles
FOR SELECT USING (
  is_public = true 
  OR (select auth.uid()) = id
);