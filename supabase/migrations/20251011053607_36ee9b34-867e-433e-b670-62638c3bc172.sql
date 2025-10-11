-- Optimize RLS policies to use (SELECT auth.uid()) for better initplan caching
-- Only updating policies referenced by the linter warnings, with correct column names

-- applications
DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;
CREATE POLICY "Users can view own applications" ON public.applications
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own applications" ON public.applications;
CREATE POLICY "Users can create own applications" ON public.applications
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own applications" ON public.applications;
CREATE POLICY "Users can update own applications" ON public.applications
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- connection_requests
DROP POLICY IF EXISTS "Users can view own connection requests" ON public.connection_requests;
CREATE POLICY "Users can view own connection requests" ON public.connection_requests
  FOR SELECT USING (((SELECT auth.uid()) = sender_id) OR ((SELECT auth.uid()) = receiver_id));

DROP POLICY IF EXISTS "Users can create connection requests" ON public.connection_requests;
CREATE POLICY "Users can create connection requests" ON public.connection_requests
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = sender_id);

DROP POLICY IF EXISTS "Users can update connection requests" ON public.connection_requests;
CREATE POLICY "Users can update connection requests" ON public.connection_requests
  FOR UPDATE USING (((SELECT auth.uid()) = sender_id) OR ((SELECT auth.uid()) = receiver_id));

-- opportunity_bookmarks
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON public.opportunity_bookmarks;
CREATE POLICY "Users can manage own bookmarks" ON public.opportunity_bookmarks
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- profile_views
DROP POLICY IF EXISTS "Users can view own profile views" ON public.profile_views;
CREATE POLICY "Users can view own profile views" ON public.profile_views
  FOR SELECT USING ((SELECT auth.uid()) = profile_id);

-- post_comments (uses user_id)
DROP POLICY IF EXISTS "Users can create own comments" ON public.post_comments;
CREATE POLICY "Users can create own comments" ON public.post_comments
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON public.post_comments;
CREATE POLICY "Users can update own comments" ON public.post_comments
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
CREATE POLICY "Users can delete own comments" ON public.post_comments
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations" ON public.conversations
  FOR SELECT USING (((SELECT auth.uid()) = user_a) OR ((SELECT auth.uid()) = user_b));

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (((SELECT auth.uid()) = user_a) OR ((SELECT auth.uid()) = user_b));

-- messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = public.messages.conversation_id
      AND (c.user_a = (SELECT auth.uid()) OR c.user_b = (SELECT auth.uid()))
  ));

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
CREATE POLICY "Users can send messages in their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    (sender_id = (SELECT auth.uid())) AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = public.messages.conversation_id
        AND (c.user_a = (SELECT auth.uid()) OR c.user_b = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING ((SELECT auth.uid()) = sender_id);

-- organizations
DROP POLICY IF EXISTS "orgs_create" ON public.organizations;
CREATE POLICY "orgs_create" ON public.organizations
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = owner_user_id);

DROP POLICY IF EXISTS "orgs_update" ON public.organizations;
CREATE POLICY "orgs_update" ON public.organizations
  FOR UPDATE USING ((SELECT auth.uid()) = owner_user_id);

-- opportunities
DROP POLICY IF EXISTS "opps_create" ON public.opportunities;
CREATE POLICY "opps_create" ON public.opportunities
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = created_by);

DROP POLICY IF EXISTS "opps_update" ON public.opportunities;
CREATE POLICY "opps_update" ON public.opportunities
  FOR UPDATE USING ((SELECT auth.uid()) = created_by);

-- opportunity_applications (uses applicant_id)
DROP POLICY IF EXISTS "apps_view" ON public.opportunity_applications;
CREATE POLICY "apps_view" ON public.opportunity_applications
  FOR SELECT USING (
    (applicant_id = (SELECT auth.uid())) OR EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = public.opportunity_applications.opportunity_id
        AND o.created_by = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "apps_create" ON public.opportunity_applications;
CREATE POLICY "apps_create" ON public.opportunity_applications
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = applicant_id);

-- opportunity_contributions (uses contributor_id)
DROP POLICY IF EXISTS "contributions_view" ON public.opportunity_contributions;
CREATE POLICY "contributions_view" ON public.opportunity_contributions
  FOR SELECT USING (
    (contributor_id = (SELECT auth.uid())) OR EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = public.opportunity_contributions.opportunity_id
        AND o.created_by = (SELECT auth.uid())
    )
  );

-- user_roles
DROP POLICY IF EXISTS "user_roles_view" ON public.user_roles;
CREATE POLICY "user_roles_view" ON public.user_roles
  FOR SELECT USING ((SELECT auth.uid()) = user_id OR has_role((SELECT auth.uid()), 'admin'::app_role));

DROP POLICY IF EXISTS "user_roles_admin" ON public.user_roles;
CREATE POLICY "user_roles_admin" ON public.user_roles
  FOR ALL USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- posts
DROP POLICY IF EXISTS "Public posts viewable by everyone" ON public.posts;
CREATE POLICY "Public posts viewable by everyone" ON public.posts
  FOR SELECT USING (
    visibility = 'public' OR author_id = (SELECT auth.uid()) OR 
    (visibility = 'connections' AND are_users_connected((SELECT auth.uid()), author_id))
  );

DROP POLICY IF EXISTS "Users create own posts" ON public.posts;
CREATE POLICY "Users create own posts" ON public.posts
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = author_id);

DROP POLICY IF EXISTS "Users update own posts" ON public.posts;
CREATE POLICY "Users update own posts" ON public.posts
  FOR UPDATE USING ((SELECT auth.uid()) = author_id);

DROP POLICY IF EXISTS "Users delete own posts" ON public.posts;
CREATE POLICY "Users delete own posts" ON public.posts
  FOR DELETE USING ((SELECT auth.uid()) = author_id);

-- post_likes (uses user_id)
DROP POLICY IF EXISTS "Post likes viewable if post viewable" ON public.post_likes;
CREATE POLICY "Post likes viewable if post viewable" ON public.post_likes
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = public.post_likes.post_id 
      AND (
        p.visibility = 'public' OR 
        p.author_id = (SELECT auth.uid()) OR 
        (p.visibility = 'connections' AND are_users_connected((SELECT auth.uid()), p.author_id))
      )
  ));

DROP POLICY IF EXISTS "Users like posts" ON public.post_likes;
CREATE POLICY "Users like posts" ON public.post_likes
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users unlike posts" ON public.post_likes;
CREATE POLICY "Users unlike posts" ON public.post_likes
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

-- events_log
DROP POLICY IF EXISTS "Users can view own events" ON public.events_log;
CREATE POLICY "Users can view own events" ON public.events_log
  FOR SELECT USING ((SELECT auth.uid()) = user_id OR has_role((SELECT auth.uid()), 'admin'::app_role));

-- organization_verification_requests
DROP POLICY IF EXISTS "Org owners can view their verification requests" ON public.organization_verification_requests;
CREATE POLICY "Org owners can view their verification requests" ON public.organization_verification_requests
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.organizations o 
    WHERE o.id = public.organization_verification_requests.organization_id 
      AND o.owner_user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Org owners can create verification requests" ON public.organization_verification_requests;
CREATE POLICY "Org owners can create verification requests" ON public.organization_verification_requests
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.organizations o 
    WHERE o.id = public.organization_verification_requests.organization_id 
      AND o.owner_user_id = (SELECT auth.uid())
  ));

-- profile_skills
DROP POLICY IF EXISTS "Users can manage their own profile skills" ON public.profile_skills;
CREATE POLICY "Users can manage their own profile skills" ON public.profile_skills
  FOR ALL USING ((SELECT auth.uid()) = profile_id)
  WITH CHECK ((SELECT auth.uid()) = profile_id);

-- profile_causes
DROP POLICY IF EXISTS "Users can manage their own profile causes" ON public.profile_causes;
CREATE POLICY "Users can manage their own profile causes" ON public.profile_causes
  FOR ALL USING ((SELECT auth.uid()) = profile_id)
  WITH CHECK ((SELECT auth.uid()) = profile_id);
