-- Database schema optimization: Fix nullable foreign keys, add indexes, and optimize RLS
-- This migration addresses critical performance and data integrity issues

-- Fix nullable foreign keys that should be required
-- Make user_id columns non-nullable where they should be required

-- 1. Fix posts table - author_id should not be nullable
ALTER TABLE public.posts 
ALTER COLUMN author_id SET NOT NULL;

-- 2. Fix comments table - author_id should not be nullable
ALTER TABLE public.comments 
ALTER COLUMN author_id SET NOT NULL;

-- 3. Fix communities table - created_by should not be nullable
ALTER TABLE public.communities 
ALTER COLUMN created_by SET NOT NULL;

-- 4. Fix events table - created_by should not be nullable  
ALTER TABLE public.events 
ALTER COLUMN created_by SET NOT NULL;

-- 5. Fix initiatives table - creator_id should not be nullable
ALTER TABLE public.initiatives 
ALTER COLUMN creator_id SET NOT NULL;

-- Add critical performance indexes for frequently queried columns

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

-- Optimize RLS policies to handle edge cases

-- Update posts RLS to handle deleted users
DROP POLICY IF EXISTS "Posts are viewable by everyone or owners" ON public.posts;
CREATE POLICY "Posts are viewable by everyone or owners" 
ON public.posts 
FOR SELECT 
USING (
  (visibility = 'public'::text) OR 
  (auth.uid() = author_id) OR
  -- Allow viewing posts even if author profile is deleted but post exists
  (visibility = 'public'::text AND author_id IS NOT NULL)
);

-- Update comments RLS to handle deleted users
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
CREATE POLICY "Comments are viewable by everyone" 
ON public.comments 
FOR SELECT 
USING (
  -- Comments are visible if the parent post is visible
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = comments.post_id 
    AND (posts.visibility = 'public'::text OR auth.uid() = posts.author_id)
  )
);

-- Update community memberships to handle edge cases
DROP POLICY IF EXISTS "Users can view community memberships" ON public.community_memberships;
CREATE POLICY "Users can view community memberships" 
ON public.community_memberships 
FOR SELECT 
USING (
  -- Members can see memberships of their communities
  EXISTS (
    SELECT 1 FROM public.community_memberships my_membership
    WHERE my_membership.community_id = community_memberships.community_id
    AND my_membership.user_id = auth.uid()
    AND my_membership.status = 'approved'
  ) OR
  -- Community creators can see all memberships
  EXISTS (
    SELECT 1 FROM public.communities c
    WHERE c.id = community_memberships.community_id
    AND c.created_by = auth.uid()
  ) OR
  -- Users can see their own membership status
  auth.uid() = community_memberships.user_id
);

-- Add function to safely handle user deletions
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- When a user is deleted, we keep their content but anonymize it
  -- This preserves community discussions while respecting user deletion
  
  -- Update posts to mark as anonymous
  UPDATE public.posts 
  SET author_id = NULL 
  WHERE author_id = OLD.id;
  
  -- Update comments to mark as anonymous  
  UPDATE public.comments 
  SET author_id = NULL 
  WHERE author_id = OLD.id;
  
  -- Remove from communities
  DELETE FROM public.community_memberships 
  WHERE user_id = OLD.id;
  
  -- Remove personal data but keep aggregated impact
  DELETE FROM public.profiles 
  WHERE id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;