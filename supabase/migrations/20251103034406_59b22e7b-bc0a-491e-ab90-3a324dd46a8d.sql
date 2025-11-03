-- Fix remaining auth_rls_initplan warnings by optimizing auth.uid() calls
-- This improves query performance by avoiding per-row re-evaluation

-- GROUP POST COMMENTS
DROP POLICY IF EXISTS "Members can view comments" ON public.group_post_comments;
CREATE POLICY "Members can view comments" ON public.group_post_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    INNER JOIN public.group_posts gp ON gp.group_id = gm.group_id
    WHERE gp.id = group_post_comments.post_id
      AND gm.user_id = (select auth.uid())
      AND gm.is_banned = false
  )
);

DROP POLICY IF EXISTS "Members can create comments" ON public.group_post_comments;
CREATE POLICY "Members can create comments" ON public.group_post_comments
FOR INSERT WITH CHECK (
  author_id = (select auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.group_members gm
    INNER JOIN public.group_posts gp ON gp.group_id = gm.group_id
    WHERE gp.id = group_post_comments.post_id
      AND gm.user_id = (select auth.uid())
      AND gm.is_banned = false
  )
);

DROP POLICY IF EXISTS "Authors can update comments" ON public.group_post_comments;
CREATE POLICY "Authors can update comments" ON public.group_post_comments
FOR UPDATE USING (author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Authors can delete comments" ON public.group_post_comments;
CREATE POLICY "Authors can delete comments" ON public.group_post_comments
FOR DELETE USING (author_id = (select auth.uid()));

-- CONVERSATIONS
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations_new;
CREATE POLICY "Users can view their conversations" ON public.conversations_new
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversations_new.id
      AND user_id = (select auth.uid())
  )
);

-- CONVERSATION PARTICIPANTS
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can update their own participant record" ON public.conversation_participants;
CREATE POLICY "Users can update their own participant record" ON public.conversation_participants
FOR UPDATE USING (user_id = (select auth.uid()));

-- MESSAGES
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages_new;
CREATE POLICY "Users can view messages in their conversations" ON public.messages_new
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages_new.conversation_id
      AND user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages_new;
CREATE POLICY "Users can send messages to their conversations" ON public.messages_new
FOR INSERT WITH CHECK (
  sender_id = (select auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages_new.conversation_id
      AND user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages_new;
CREATE POLICY "Users can update their own messages" ON public.messages_new
FOR UPDATE USING (sender_id = (select auth.uid()));

-- POSTS
DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
CREATE POLICY "Users can view their own posts" ON public.posts
FOR SELECT USING (author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view connection posts" ON public.posts;
CREATE POLICY "Users can view connection posts" ON public.posts
FOR SELECT USING (
  privacy_level = 'connections' AND
  EXISTS (
    SELECT 1 FROM public.connections
    WHERE ((requester_id = (select auth.uid()) AND recipient_id = posts.author_id)
       OR (recipient_id = (select auth.uid()) AND requester_id = posts.author_id))
      AND status = 'accepted'
  )
);

DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
CREATE POLICY "Users can create posts" ON public.posts
FOR INSERT WITH CHECK (author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts" ON public.posts
FOR UPDATE USING (author_id = (select auth.uid()));

-- POST LIKES
DROP POLICY IF EXISTS "Users can view likes on visible posts" ON public.post_likes;
CREATE POLICY "Users can view likes on visible posts" ON public.post_likes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_likes.post_id
      AND (
        posts.privacy_level = 'public' OR
        posts.author_id = (select auth.uid()) OR
        (posts.privacy_level = 'connections' AND
         EXISTS (
           SELECT 1 FROM public.connections
           WHERE ((requester_id = (select auth.uid()) AND recipient_id = posts.author_id)
              OR (recipient_id = (select auth.uid()) AND requester_id = posts.author_id))
             AND status = 'accepted'
         ))
      )
  )
);

DROP POLICY IF EXISTS "Users can create likes" ON public.post_likes;
CREATE POLICY "Users can create likes" ON public.post_likes
FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own likes" ON public.post_likes;
CREATE POLICY "Users can delete their own likes" ON public.post_likes
FOR DELETE USING (user_id = (select auth.uid()));

-- POST COMMENTS
DROP POLICY IF EXISTS "Users can view comments on visible posts" ON public.post_comments;
CREATE POLICY "Users can view comments on visible posts" ON public.post_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_comments.post_id
      AND (
        posts.privacy_level = 'public' OR
        posts.author_id = (select auth.uid()) OR
        (posts.privacy_level = 'connections' AND
         EXISTS (
           SELECT 1 FROM public.connections
           WHERE ((requester_id = (select auth.uid()) AND recipient_id = posts.author_id)
              OR (recipient_id = (select auth.uid()) AND requester_id = posts.author_id))
             AND status = 'accepted'
         ))
      )
  )
);

DROP POLICY IF EXISTS "Users can create comments" ON public.post_comments;
CREATE POLICY "Users can create comments" ON public.post_comments
FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own comments" ON public.post_comments;
CREATE POLICY "Users can update own comments" ON public.post_comments
FOR UPDATE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
CREATE POLICY "Users can delete own comments" ON public.post_comments
FOR DELETE USING (user_id = (select auth.uid()));

-- EVENTS (remaining policies)
DROP POLICY IF EXISTS "Users can view their own events" ON public.events;
CREATE POLICY "Users can view their own events" ON public.events
FOR SELECT USING (organizer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their invited events" ON public.events;
CREATE POLICY "Users can view their invited events" ON public.events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.event_attendees
    WHERE event_id = events.id
      AND user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can create events" ON public.events;
CREATE POLICY "Users can create events" ON public.events
FOR INSERT WITH CHECK (organizer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
CREATE POLICY "Users can update their own events" ON public.events
FOR UPDATE USING (organizer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;
CREATE POLICY "Users can delete their own events" ON public.events
FOR DELETE USING (organizer_id = (select auth.uid()));

-- EVENT ATTENDEES
DROP POLICY IF EXISTS "Users can view attendees of their events" ON public.event_attendees;
CREATE POLICY "Users can view attendees of their events" ON public.event_attendees
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_attendees.event_id
      AND events.organizer_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can RSVP to events" ON public.event_attendees;
CREATE POLICY "Users can RSVP to events" ON public.event_attendees
FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own RSVP" ON public.event_attendees;
CREATE POLICY "Users can update their own RSVP" ON public.event_attendees
FOR UPDATE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Organizers can update attendee status" ON public.event_attendees;
CREATE POLICY "Organizers can update attendee status" ON public.event_attendees
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_attendees.event_id
      AND events.organizer_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can delete their own RSVP" ON public.event_attendees;
CREATE POLICY "Users can delete their own RSVP" ON public.event_attendees
FOR DELETE USING (user_id = (select auth.uid()));

-- EVENT COMMENTS
DROP POLICY IF EXISTS "Users can view comments on visible events" ON public.event_comments;
CREATE POLICY "Users can view comments on visible events" ON public.event_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_comments.event_id
      AND (
        events.is_public = true OR
        events.organizer_id = (select auth.uid()) OR
        EXISTS (
          SELECT 1 FROM public.event_attendees
          WHERE event_id = events.id
            AND user_id = (select auth.uid())
        )
      )
  )
);

DROP POLICY IF EXISTS "Users can create comments" ON public.event_comments;
CREATE POLICY "Users can create comments" ON public.event_comments
FOR INSERT WITH CHECK (author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own comments" ON public.event_comments;
CREATE POLICY "Users can update their own comments" ON public.event_comments
FOR UPDATE USING (author_id = (select auth.uid()));

-- GROUP MEMBERS
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;
CREATE POLICY "Members can view group members" ON public.group_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id
      AND gm.user_id = (select auth.uid())
      AND gm.is_banned = false
  )
);

DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
CREATE POLICY "Users can join groups" ON public.group_members
FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
CREATE POLICY "Users can leave groups" ON public.group_members
FOR DELETE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can update members" ON public.group_members;
CREATE POLICY "Admins can update members" ON public.group_members
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id
      AND gm.user_id = (select auth.uid())
      AND gm.role IN ('owner', 'admin')
      AND gm.is_banned = false
  )
);

-- GROUP POSTS (remaining policies)
DROP POLICY IF EXISTS "Authors can update their posts" ON public.group_posts;
CREATE POLICY "Authors can update their posts" ON public.group_posts
FOR UPDATE USING (author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Authors can delete their posts" ON public.group_posts;
CREATE POLICY "Authors can delete their posts" ON public.group_posts
FOR DELETE USING (author_id = (select auth.uid()));

-- GROUP POST LIKES
DROP POLICY IF EXISTS "Members can view likes" ON public.group_post_likes;
CREATE POLICY "Members can view likes" ON public.group_post_likes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    INNER JOIN public.group_posts gp ON gp.group_id = gm.group_id
    WHERE gp.id = group_post_likes.post_id
      AND gm.user_id = (select auth.uid())
      AND gm.is_banned = false
  )
);

DROP POLICY IF EXISTS "Users can unlike posts" ON public.group_post_likes;
CREATE POLICY "Users can unlike posts" ON public.group_post_likes
FOR DELETE USING (user_id = (select auth.uid()));

-- GROUPS
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
CREATE POLICY "Users can create groups" ON public.groups
FOR INSERT WITH CHECK (created_by = (select auth.uid()));