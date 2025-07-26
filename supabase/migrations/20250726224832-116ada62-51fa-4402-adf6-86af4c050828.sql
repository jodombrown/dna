-- Create storage policies for post media uploads

-- Policies for profile-images bucket (used by EnhancedPostComposer for images)
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload their own images to profile-images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to view images
CREATE POLICY "Profile images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-images');

-- Allow users to update their own images
CREATE POLICY "Users can update their own profile images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own profile images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies for user-posts bucket (used by EnhancedPostComposer for videos and other media)
INSERT INTO storage.buckets (id, name, public) VALUES ('user-posts', 'user-posts', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated users to upload their own post media
CREATE POLICY "Users can upload their own post media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'user-posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to view post media
CREATE POLICY "Post media is publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'user-posts');

-- Allow users to update their own post media
CREATE POLICY "Users can update their own post media" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'user-posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own post media
CREATE POLICY "Users can delete their own post media" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'user-posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);