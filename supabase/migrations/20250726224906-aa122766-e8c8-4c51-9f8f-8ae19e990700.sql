-- Create only the missing storage policies

-- First, ensure the buckets exist and are public
INSERT INTO storage.buckets (id, name, public) VALUES ('user-posts', 'user-posts', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Check if profile-images bucket exists and ensure it's public
UPDATE storage.buckets SET public = true WHERE id = 'profile-images';

-- Create missing policies only (use IF NOT EXISTS where possible)

-- For profile-images bucket
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload their own images to profile-images') THEN
    CREATE POLICY "Users can upload their own images to profile-images" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (
      bucket_id = 'profile-images' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Profile images are publicly accessible for posts') THEN
    CREATE POLICY "Profile images are publicly accessible for posts" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'profile-images');
  END IF;
END $$;

-- For user-posts bucket  
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload their own post media') THEN
    CREATE POLICY "Users can upload their own post media" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (
      bucket_id = 'user-posts' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Post media is publicly accessible') THEN
    CREATE POLICY "Post media is publicly accessible" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'user-posts');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update their own post media') THEN
    CREATE POLICY "Users can update their own post media" 
    ON storage.objects 
    FOR UPDATE 
    USING (
      bucket_id = 'user-posts' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete their own post media') THEN
    CREATE POLICY "Users can delete their own post media" 
    ON storage.objects 
    FOR DELETE 
    USING (
      bucket_id = 'user-posts' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;