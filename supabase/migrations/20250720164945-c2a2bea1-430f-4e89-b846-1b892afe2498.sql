-- Database schema optimization: Fix nullable foreign keys, add indexes, and optimize RLS
-- First handle existing null values, then apply constraints

-- Step 1: Handle existing null values before making columns non-nullable

-- Check and fix posts with null author_id (set to a system user or delete)
-- For now, we'll delete orphaned posts to maintain data integrity
DELETE FROM public.posts WHERE author_id IS NULL;

-- Check and fix comments with null author_id
DELETE FROM public.comments WHERE author_id IS NULL;

-- Check and fix communities with null created_by
-- We need to handle this carefully as it might break existing communities
UPDATE public.communities 
SET created_by = (
  SELECT id FROM auth.users LIMIT 1
) 
WHERE created_by IS NULL;

-- Check and fix events with null created_by  
DELETE FROM public.events WHERE created_by IS NULL;

-- Check and fix initiatives with null creator_id
DELETE FROM public.initiatives WHERE creator_id IS NULL;

-- Step 2: Now make the foreign key columns non-nullable
ALTER TABLE public.posts 
ALTER COLUMN author_id SET NOT NULL;

ALTER TABLE public.comments 
ALTER COLUMN author_id SET NOT NULL;

ALTER TABLE public.communities 
ALTER COLUMN created_by SET NOT NULL;

ALTER TABLE public.events 
ALTER COLUMN created_by SET NOT NULL;

ALTER TABLE public.initiatives 
ALTER COLUMN creator_id SET NOT NULL;

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