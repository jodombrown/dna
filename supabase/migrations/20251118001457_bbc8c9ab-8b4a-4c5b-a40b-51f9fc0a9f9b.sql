-- Fix foreign key constraint for posts.space_id to point to collaboration_spaces
-- Drop the incorrect constraint
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_space_id_fkey;

-- Add correct constraint pointing to collaboration_spaces
ALTER TABLE posts 
ADD CONSTRAINT posts_space_id_fkey 
FOREIGN KEY (space_id) 
REFERENCES collaboration_spaces(id) 
ON DELETE SET NULL;