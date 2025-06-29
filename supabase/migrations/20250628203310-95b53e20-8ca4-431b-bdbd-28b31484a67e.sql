
-- Check and add missing foreign key constraints

-- Add foreign key constraint for events to profiles (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'events_created_by_fkey' 
        AND table_name = 'events'
    ) THEN
        ALTER TABLE public.events
        ADD CONSTRAINT events_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key constraint for communities to profiles (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'communities_created_by_fkey' 
        AND table_name = 'communities'
    ) THEN
        ALTER TABLE public.communities 
        ADD CONSTRAINT communities_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for posts to events (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'posts_shared_event_id_fkey' 
        AND table_name = 'posts'
    ) THEN
        ALTER TABLE public.posts 
        ADD CONSTRAINT posts_shared_event_id_fkey 
        FOREIGN KEY (shared_event_id) REFERENCES public.events(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key constraint for posts to communities (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'posts_shared_community_id_fkey' 
        AND table_name = 'posts'
    ) THEN
        ALTER TABLE public.posts 
        ADD CONSTRAINT posts_shared_community_id_fkey 
        FOREIGN KEY (shared_community_id) REFERENCES public.communities(id) ON DELETE SET NULL;
    END IF;
END $$;
