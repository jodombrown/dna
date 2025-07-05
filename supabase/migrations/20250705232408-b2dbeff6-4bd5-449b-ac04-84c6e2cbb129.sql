-- Now apply the proper foreign key constraints with CASCADE behavior

-- Drop existing foreign key constraints if they exist
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_created_by_fkey;
ALTER TABLE public.user_communities DROP CONSTRAINT IF EXISTS user_communities_owner_id_fkey;
ALTER TABLE public.communities DROP CONSTRAINT IF EXISTS communities_created_by_fkey;

-- Add new foreign key constraints with SET NULL on delete
-- This means when a user is deleted, their content remains but the creator reference becomes null

ALTER TABLE public.events 
ADD CONSTRAINT events_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES public.users(id) 
ON DELETE SET NULL;

ALTER TABLE public.user_communities 
ADD CONSTRAINT user_communities_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES public.users(id) 
ON DELETE SET NULL;

ALTER TABLE public.communities 
ADD CONSTRAINT communities_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES public.users(id) 
ON DELETE SET NULL;