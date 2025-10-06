-- Enable real-time for posts table
ALTER TABLE public.posts REPLICA IDENTITY FULL;

-- Add posts table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

-- Enable real-time for post_likes table
ALTER TABLE public.post_likes REPLICA IDENTITY FULL;

-- Add post_likes table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;

-- Enable real-time for comments table (if not already enabled)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'comments'
  ) THEN
    ALTER TABLE public.comments REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  END IF;
END $$;