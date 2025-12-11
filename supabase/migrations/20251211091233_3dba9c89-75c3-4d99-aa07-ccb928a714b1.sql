-- Create messages storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'messages',
  'messages',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/webm', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'application/pdf', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/webm', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'application/pdf', 'video/mp4', 'video/webm'];

-- Create storage policies for messages bucket
CREATE POLICY "Authenticated users can upload message files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'messages');

CREATE POLICY "Anyone can view message files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'messages');

CREATE POLICY "Users can delete their own message files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'messages' AND (storage.foldername(name))[2] = auth.uid()::text);