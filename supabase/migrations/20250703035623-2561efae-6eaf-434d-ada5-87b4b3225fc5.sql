
-- Create storage bucket for user posts
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-posts', 'user-posts', true);

-- Create RLS policies for the user-posts bucket
CREATE POLICY "Users can upload their own post images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'user-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view post images" ON storage.objects
FOR SELECT USING (bucket_id = 'user-posts');

CREATE POLICY "Users can update their own post images" ON storage.objects
FOR UPDATE USING (bucket_id = 'user-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own post images" ON storage.objects
FOR DELETE USING (bucket_id = 'user-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add image_url column to posts table if it doesn't exist
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update posts table to ensure hashtags column exists (it already does, but ensuring consistency)
-- The hashtags column already exists as TEXT[] which is perfect for our needs
