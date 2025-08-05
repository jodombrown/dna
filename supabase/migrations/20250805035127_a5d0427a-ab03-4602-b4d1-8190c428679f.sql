-- Sprint 1: Critical onboarding field mapping and validation fixes

-- 1. Add missing twitter_url field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- 2. Add missing agrees_to_values field for consent tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS agrees_to_values BOOLEAN DEFAULT false;

-- 3. Create index for username uniqueness check performance
CREATE INDEX IF NOT EXISTS idx_profiles_username_unique 
ON public.profiles (lower(username)) 
WHERE username IS NOT NULL;

-- 4. Update storage bucket policies for avatar uploads
-- Ensure profile-images bucket has proper access policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images', 
  'profile-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create storage policies for profile images
CREATE POLICY "Public access for profile images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);