-- Add INSERT policy for banners bucket to allow authenticated users to upload their own banners
CREATE POLICY "Users can upload their own banners"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add UPDATE policy for banners bucket to allow users to update their own banners
CREATE POLICY "Users can update their own banners"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add DELETE policy for banners bucket to allow users to delete their own banners
CREATE POLICY "Users can delete their own banners"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);