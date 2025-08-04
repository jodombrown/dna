-- First, drop the policy that depends on author_id
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;

-- Drop old foreign key if exists
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

-- Ensure author_id has the same type as profiles.id (UUID)
ALTER TABLE public.posts ALTER COLUMN author_id TYPE uuid USING author_id::uuid;

-- Add new foreign key constraint linking posts.author_id to profiles.id
ALTER TABLE public.posts 
  ADD CONSTRAINT posts_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Recreate the RLS policy
CREATE POLICY "Users can create their own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);