-- Fix Supabase performance advisor warnings (corrected version)
-- This migration addresses auth RLS initialization plan issues, multiple permissive policies, and duplicate indexes

-- 1. Fix auth RLS initialization plan issues by wrapping auth.uid() calls in subqueries

-- Fix error_logs table
DROP POLICY IF EXISTS "Admins can view all error logs" ON public.error_logs;
CREATE POLICY "Admins can view all error logs" 
ON public.error_logs 
FOR SELECT 
USING (is_admin_user((select auth.uid())));

-- Fix posts table
DROP POLICY IF EXISTS "Posts are viewable by everyone or owners" ON public.posts;
CREATE POLICY "Posts are viewable by everyone or owners" 
ON public.posts 
FOR SELECT 
USING ((visibility = 'public'::text) OR ((select auth.uid()) = author_id));

-- Fix community_memberships table
DROP POLICY IF EXISTS "Users can remove their own memberships" ON public.community_memberships;
DROP POLICY IF EXISTS "Users can request to join communities" ON public.community_memberships;
DROP POLICY IF EXISTS "Community admins can approve/reject join requests" ON public.community_memberships;

CREATE POLICY "Users can remove their own memberships" 
ON public.community_memberships 
FOR DELETE 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can request to join communities" 
ON public.community_memberships 
FOR INSERT 
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Community admins can approve/reject join requests" 
ON public.community_memberships 
FOR UPDATE 
USING ((EXISTS ( SELECT 1
   FROM communities c
  WHERE ((c.id = community_memberships.community_id) AND (c.created_by = (select auth.uid()))))) OR (EXISTS ( SELECT 1
   FROM community_memberships cm
  WHERE ((cm.community_id = community_memberships.community_id) AND (cm.user_id = (select auth.uid())) AND (cm.role = ANY (ARRAY['admin'::text, 'moderator'::text])) AND (cm.status = 'approved'::text)))));

-- Fix message_reactions table
DROP POLICY IF EXISTS "Message reactions are viewable by conversation participants" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can create message reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can delete their own message reactions" ON public.message_reactions;

CREATE POLICY "Message reactions are viewable by conversation participants" 
ON public.message_reactions 
FOR SELECT 
USING ((EXISTS ( SELECT 1
   FROM (messages m
     JOIN conversations c ON ((c.id = m.conversation_id)))
  WHERE ((m.id = message_reactions.message_id) AND ((c.user_1_id = (select auth.uid())) OR (c.user_2_id = (select auth.uid())))))));

CREATE POLICY "Users can create message reactions" 
ON public.message_reactions 
FOR INSERT 
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own message reactions" 
ON public.message_reactions 
FOR DELETE 
USING ((select auth.uid()) = user_id);

-- Fix community_posts table
DROP POLICY IF EXISTS "Community posts viewable by community members" ON public.community_posts;
DROP POLICY IF EXISTS "Community members can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authors and community admins can delete posts" ON public.community_posts;

CREATE POLICY "Community posts viewable by community members" 
ON public.community_posts 
FOR SELECT 
USING ((EXISTS ( SELECT 1
   FROM community_memberships cm
  WHERE ((cm.community_id = community_posts.community_id) AND (cm.user_id = (select auth.uid())) AND (cm.status = 'approved'::text)))) OR (EXISTS ( SELECT 1
   FROM communities c
  WHERE ((c.id = community_posts.community_id) AND (c.created_by = (select auth.uid()))))));

CREATE POLICY "Community members can create posts" 
ON public.community_posts 
FOR INSERT 
WITH CHECK (((select auth.uid()) = author_id) AND ((EXISTS ( SELECT 1
   FROM community_memberships cm
  WHERE ((cm.community_id = community_posts.community_id) AND (cm.user_id = (select auth.uid())) AND (cm.status = 'approved'::text)))) OR (EXISTS ( SELECT 1
   FROM communities c
  WHERE ((c.id = community_posts.community_id) AND (c.created_by = (select auth.uid())))))));

CREATE POLICY "Authors can update their own posts" 
ON public.community_posts 
FOR UPDATE 
USING ((select auth.uid()) = author_id);

CREATE POLICY "Authors and community admins can delete posts" 
ON public.community_posts 
FOR DELETE 
USING (((select auth.uid()) = author_id) OR (EXISTS ( SELECT 1
   FROM communities c
  WHERE ((c.id = community_posts.community_id) AND (c.created_by = (select auth.uid()))))) OR (EXISTS ( SELECT 1
   FROM community_memberships cm
  WHERE ((cm.community_id = community_posts.community_id) AND (cm.user_id = (select auth.uid())) AND (cm.role = 'admin'::text)))));

-- Fix community_events table
DROP POLICY IF EXISTS "Event creators can update their events" ON public.community_events;
DROP POLICY IF EXISTS "Community events viewable by community members" ON public.community_events;
DROP POLICY IF EXISTS "Community members can create events" ON public.community_events;
DROP POLICY IF EXISTS "Event creators and community admins can delete events" ON public.community_events;

CREATE POLICY "Event creators can update their events" 
ON public.community_events 
FOR UPDATE 
USING ((select auth.uid()) = created_by);

CREATE POLICY "Community events viewable by community members" 
ON public.community_events 
FOR SELECT 
USING ((EXISTS ( SELECT 1
   FROM community_memberships cm
  WHERE ((cm.community_id = community_events.community_id) AND (cm.user_id = (select auth.uid())) AND (cm.status = 'approved'::text)))) OR (EXISTS ( SELECT 1
   FROM communities c
  WHERE ((c.id = community_events.community_id) AND (c.created_by = (select auth.uid()))))));

CREATE POLICY "Community members can create events" 
ON public.community_events 
FOR INSERT 
WITH CHECK (((select auth.uid()) = created_by) AND ((EXISTS ( SELECT 1
   FROM community_memberships cm
  WHERE ((cm.community_id = community_events.community_id) AND (cm.user_id = (select auth.uid())) AND (cm.status = 'approved'::text)))) OR (EXISTS ( SELECT 1
   FROM communities c
  WHERE ((c.id = community_events.community_id) AND (c.created_by = (select auth.uid())))))));

CREATE POLICY "Event creators and community admins can delete events" 
ON public.community_events 
FOR DELETE 
USING (((select auth.uid()) = created_by) OR (EXISTS ( SELECT 1
   FROM communities c
  WHERE ((c.id = community_events.community_id) AND (c.created_by = (select auth.uid()))))));

-- 2. Fix multiple permissive policies by consolidating community_event_attendees policies
DROP POLICY IF EXISTS "Event attendees viewable by community members" ON public.community_event_attendees;
DROP POLICY IF EXISTS "Users can manage their own event attendance" ON public.community_event_attendees;

-- Create single consolidated policy for community_event_attendees
CREATE POLICY "Community event attendees access policy" 
ON public.community_event_attendees 
FOR ALL 
USING ((EXISTS ( SELECT 1
   FROM (community_events ce
     JOIN community_memberships cm ON ((cm.community_id = ce.community_id)))
  WHERE ((ce.id = community_event_attendees.event_id) AND (cm.user_id = (select auth.uid())) AND (cm.status = 'approved'::text)))) OR ((select auth.uid()) = user_id));

-- Fix comments table
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
CREATE POLICY "Comments are viewable by everyone" 
ON public.comments 
FOR SELECT 
USING ((EXISTS ( SELECT 1
   FROM posts
  WHERE ((posts.id = comments.post_id) AND (posts.visibility = 'public'::text)))) OR (EXISTS ( SELECT 1
   FROM posts
  WHERE ((posts.id = comments.post_id) AND (posts.author_id = (select auth.uid()))))));

-- 3. Remove duplicate indexes
DROP INDEX IF EXISTS idx_events_date_time; -- Keep idx_events_date
DROP INDEX IF EXISTS profiles_username_idx; -- Keep idx_profiles_username