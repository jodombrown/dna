-- Fix foreign key constraints to handle user deletion gracefully
-- Drop the existing foreign key constraint on events table
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_created_by_fkey;

-- Add new foreign key constraint with SET NULL on delete
-- This means when a user is deleted, their events remain but created_by becomes null
ALTER TABLE public.events 
ADD CONSTRAINT events_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES public.users(id) 
ON DELETE SET NULL;

-- Also fix the user_communities table constraint
ALTER TABLE public.user_communities DROP CONSTRAINT IF EXISTS user_communities_owner_id_fkey;

-- Add new foreign key constraint with SET NULL on delete for user_communities
ALTER TABLE public.user_communities 
ADD CONSTRAINT user_communities_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES public.users(id) 
ON DELETE SET NULL;

-- Fix any other potential foreign key issues with communities table
ALTER TABLE public.communities DROP CONSTRAINT IF EXISTS communities_created_by_fkey;

-- Add proper foreign key for communities
ALTER TABLE public.communities 
ADD CONSTRAINT communities_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES public.users(id) 
ON DELETE SET NULL;