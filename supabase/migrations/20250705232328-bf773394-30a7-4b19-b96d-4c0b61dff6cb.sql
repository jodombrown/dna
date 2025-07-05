-- First, clean up orphaned data by setting created_by to NULL where the referenced user doesn't exist

-- Fix events table - set created_by to NULL where user doesn't exist
UPDATE public.events 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
AND created_by NOT IN (SELECT id FROM public.users);

-- Fix communities table - set created_by to NULL where user doesn't exist  
UPDATE public.communities 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
AND created_by NOT IN (SELECT id FROM public.users);

-- Fix user_communities table - set owner_id to NULL where user doesn't exist
UPDATE public.user_communities 
SET owner_id = NULL 
WHERE owner_id IS NOT NULL 
AND owner_id NOT IN (SELECT id FROM public.users);