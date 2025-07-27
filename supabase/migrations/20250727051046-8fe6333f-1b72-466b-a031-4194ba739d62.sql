-- Fix posts table foreign key constraints to reference correct tables

-- Drop the incorrect foreign key constraint that references non-existent 'users' table
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

-- Add correct foreign key constraint referencing auth.users
ALTER TABLE public.posts 
ADD CONSTRAINT posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;