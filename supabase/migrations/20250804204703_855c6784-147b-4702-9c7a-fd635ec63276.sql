-- Add parent_id column for nested comments if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'post_comments' 
        AND column_name = 'parent_id'
    ) THEN
        ALTER TABLE public.post_comments 
        ADD COLUMN parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE;
        
        -- Add index for better performance
        CREATE INDEX idx_post_comments_parent_id ON public.post_comments(parent_id);
    END IF;
END $$;