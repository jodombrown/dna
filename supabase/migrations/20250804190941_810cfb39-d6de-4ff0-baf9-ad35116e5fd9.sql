-- Drop ALL policies that reference author_id across all tables
-- Posts table policies
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts or admins can delete any" ON public.posts;
DROP POLICY IF EXISTS "Posts are viewable by everyone or owners" ON public.posts;

-- Comments table policies  
DROP POLICY IF EXISTS "Users can create their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments or admins can delete any" ON public.comments;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;

-- Community posts table policies
DROP POLICY IF EXISTS "Community members can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authors and community admins can delete posts" ON public.community_posts;

-- Drop old foreign keys
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE public.community_posts DROP CONSTRAINT IF EXISTS community_posts_author_id_fkey;

-- Fix author_id column types
ALTER TABLE public.posts ALTER COLUMN author_id TYPE uuid USING author_id::uuid;
ALTER TABLE public.comments ALTER COLUMN author_id TYPE uuid USING author_id::uuid;
ALTER TABLE public.community_posts ALTER COLUMN author_id TYPE uuid USING author_id::uuid;

-- Add new foreign key constraints
ALTER TABLE public.posts 
  ADD CONSTRAINT posts_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.comments 
  ADD CONSTRAINT comments_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.community_posts 
  ADD CONSTRAINT community_posts_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;