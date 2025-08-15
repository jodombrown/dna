-- Create post-media storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for post-media bucket
CREATE POLICY "Public access to post media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'post-media');

CREATE POLICY "Users can upload their own post media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own post media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own post media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for posts table if not already done
ALTER TABLE public.posts REPLICA IDENTITY FULL;

-- Add posts to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

-- Enable realtime for post_likes table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'post_likes'
  ) THEN
    ALTER TABLE public.post_likes REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
  END IF;
END $$;

-- Enable realtime for saved_posts table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'saved_posts'
  ) THEN
    ALTER TABLE public.saved_posts REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_posts;
  END IF;
END $$;