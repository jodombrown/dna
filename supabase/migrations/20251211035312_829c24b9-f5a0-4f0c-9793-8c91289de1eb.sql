-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to message-attachments bucket
CREATE POLICY "Users can upload message attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message-attachments');

-- Allow public read access to message attachments
CREATE POLICY "Public can view message attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'message-attachments');

-- Allow users to delete their own attachments
CREATE POLICY "Users can delete own message attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);