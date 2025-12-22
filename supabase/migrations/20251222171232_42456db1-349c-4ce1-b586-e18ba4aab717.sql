-- Create RLS policies for feedback-media bucket

-- Allow anyone to view feedback media (bucket is public)
CREATE POLICY "Anyone can view feedback media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'feedback-media');

-- Allow authenticated users to upload to feedback-media
CREATE POLICY "Authenticated users can upload feedback media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'feedback-media');

-- Allow users to update their own feedback media
CREATE POLICY "Users can update their own feedback media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'feedback-media' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'feedback-media' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Allow users to delete their own feedback media
CREATE POLICY "Users can delete their own feedback media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'feedback-media' AND (auth.uid())::text = (storage.foldername(name))[1]);