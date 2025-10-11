-- Fix remaining RLS performance warnings

-- invites policies
DROP POLICY IF EXISTS "Admins can create invites" ON public.invites;
CREATE POLICY "Admins can create invites" ON public.invites
  FOR INSERT WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all invites" ON public.invites;
CREATE POLICY "Admins can view all invites" ON public.invites
  FOR SELECT USING (has_role((SELECT auth.uid()), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view their own invites" ON public.invites;
CREATE POLICY "Users can view their own invites" ON public.invites
  FOR SELECT USING (email = (SELECT auth.email()) OR created_by = (SELECT auth.uid()));

-- feature_flags: Admins manage feature flags (ALL policy)
DROP POLICY IF EXISTS "Admins manage feature flags" ON public.feature_flags;
CREATE POLICY "Admins manage feature flags" ON public.feature_flags
  FOR ALL USING (has_role((SELECT auth.uid()), 'admin'::app_role))
  WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

-- post_analytics: Authenticated users can log events
DROP POLICY IF EXISTS "Authenticated users can log events" ON public.post_analytics;
CREATE POLICY "Authenticated users can log events" ON public.post_analytics
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- profile_views policies
DROP POLICY IF EXISTS "Authenticated users can log views" ON public.profile_views;
CREATE POLICY "Authenticated users can log views" ON public.profile_views
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Profile owners can view their analytics" ON public.profile_views;
CREATE POLICY "Profile owners can view their analytics" ON public.profile_views
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

-- profiles: Public profiles with privacy controls
DROP POLICY IF EXISTS "Public profiles with privacy controls" ON public.profiles;
CREATE POLICY "Public profiles with privacy controls" ON public.profiles
  FOR SELECT USING (is_public = true OR id = (SELECT auth.uid()));