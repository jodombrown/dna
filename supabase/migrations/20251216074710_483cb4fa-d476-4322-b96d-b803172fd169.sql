-- Create avatars bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create banners bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can view banners" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own banner" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own banner" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own banner" ON storage.objects;

-- Avatar bucket policies
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Banner bucket policies
CREATE POLICY "Anyone can view banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Users can upload their own banner"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own banner"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own banner"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);