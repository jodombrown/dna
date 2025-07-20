-- Database schema optimization: Safe approach to handle data integrity and performance
-- Handle orphaned data carefully and add performance indexes

-- Step 1: Clean up orphaned data safely
-- Delete communities that reference non-existent users
DELETE FROM public.communities 
WHERE created_by IS NOT NULL 
AND NOT EXISTS (
  SELECT 1 FROM auth.users WHERE id = communities.created_by
);

-- Delete communities with null created_by
DELETE FROM public.communities WHERE created_by IS NULL;

-- Delete posts that reference non-existent users
DELETE FROM public.posts 
WHERE author_id IS NOT NULL 
AND NOT EXISTS (
  SELECT 1 FROM auth.users WHERE id = posts.author_id
);

-- Delete posts with null author_id
DELETE FROM public.posts WHERE author_id IS NULL;

-- Delete comments that reference non-existent users
DELETE FROM public.comments 
WHERE author_id IS NOT NULL 
AND NOT EXISTS (
  SELECT 1 FROM auth.users WHERE id = comments.author_id
);

-- Delete comments with null author_id
DELETE FROM public.comments WHERE author_id IS NULL;

-- Delete events that reference non-existent users
DELETE FROM public.events 
WHERE created_by IS NOT NULL 
AND NOT EXISTS (
  SELECT 1 FROM auth.users WHERE id = events.created_by
);

-- Delete events with null created_by
DELETE FROM public.events WHERE created_by IS NULL;

-- Delete initiatives that reference non-existent users
DELETE FROM public.initiatives 
WHERE creator_id IS NOT NULL 
AND NOT EXISTS (
  SELECT 1 FROM auth.users WHERE id = initiatives.creator_id
);

-- Delete initiatives with null creator_id
DELETE FROM public.initiatives WHERE creator_id IS NULL;

-- Step 2: Now make the foreign key columns non-nullable (only if tables are empty or valid)
DO $$
BEGIN
  -- Only alter if there are no null values remaining
  IF NOT EXISTS (SELECT 1 FROM public.posts WHERE author_id IS NULL) THEN
    ALTER TABLE public.posts ALTER COLUMN author_id SET NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.comments WHERE author_id IS NULL) THEN
    ALTER TABLE public.comments ALTER COLUMN author_id SET NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.communities WHERE created_by IS NULL) THEN
    ALTER TABLE public.communities ALTER COLUMN created_by SET NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.events WHERE created_by IS NULL) THEN
    ALTER TABLE public.events ALTER COLUMN created_by SET NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.initiatives WHERE creator_id IS NULL) THEN
    ALTER TABLE public.initiatives ALTER COLUMN creator_id SET NOT NULL;
  END IF;
END $$;

-- Step 3: Add critical performance indexes for frequently queried columns

-- Posts performance indexes
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_pillar ON public.posts(pillar);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON public.posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_author_created ON public.posts(author_id, created_at DESC);

-- Comments performance indexes  
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON public.comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- Communities performance indexes
CREATE INDEX IF NOT EXISTS idx_communities_created_at ON public.communities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communities_category ON public.communities(category);
CREATE INDEX IF NOT EXISTS idx_communities_active_featured ON public.communities(is_active, is_featured);

-- Community memberships performance indexes
CREATE INDEX IF NOT EXISTS idx_community_memberships_user_status ON public.community_memberships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_community_memberships_community_status ON public.community_memberships(community_id, status);

-- Events performance indexes
CREATE INDEX IF NOT EXISTS idx_events_date_time ON public.events(date_time);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(is_featured);

-- Notifications performance indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Contact requests performance indexes  
CREATE INDEX IF NOT EXISTS idx_contact_requests_receiver_status ON public.contact_requests(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_sender_status ON public.contact_requests(sender_id, status);

-- Messages performance indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at DESC);

-- Impact log performance indexes
CREATE INDEX IF NOT EXISTS idx_impact_log_user_created ON public.impact_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_impact_log_pillar ON public.impact_log(pillar);

-- Profile performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_public ON public.profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);

-- User DNA points performance indexes
CREATE INDEX IF NOT EXISTS idx_user_dna_points_total_score ON public.user_dna_points(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_dna_points_last_updated ON public.user_dna_points(last_updated DESC);

-- Step 4: Optimize RLS policies to handle edge cases

-- Update posts RLS to handle better performance
DROP POLICY IF EXISTS "Posts are viewable by everyone or owners" ON public.posts;
CREATE POLICY "Posts are viewable by everyone or owners" 
ON public.posts 
FOR SELECT 
USING (
  (visibility = 'public'::text) OR 
  (auth.uid() = author_id)
);

-- Update comments RLS for better performance
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
CREATE POLICY "Comments are viewable by everyone" 
ON public.comments 
FOR SELECT 
USING (
  -- Comments are visible if the parent post is visible and public
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = comments.post_id 
    AND posts.visibility = 'public'::text
  ) OR
  -- Or if the user owns the parent post
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = comments.post_id 
    AND posts.author_id = auth.uid()
  )
);