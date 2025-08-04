-- If an old foreign key exists (pointing to public.users), drop it first:
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

-- Ensure author_id has the same type as profiles.id (UUID in this case):
ALTER TABLE public.posts ALTER COLUMN author_id TYPE uuid USING author_id::uuid;

-- Add a new foreign key constraint linking posts.author_id to profiles.id:
ALTER TABLE public.posts 
  ADD CONSTRAINT posts_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;