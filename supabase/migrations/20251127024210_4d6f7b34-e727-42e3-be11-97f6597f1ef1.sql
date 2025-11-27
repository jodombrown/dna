-- Create storage bucket for story hero images (Story v1.3)
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-hero-images', 'story-hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for story hero images
CREATE POLICY "Anyone can view story hero images"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-hero-images');

CREATE POLICY "Authenticated users can upload story hero images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'story-hero-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own story hero images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'story-hero-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own story hero images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'story-hero-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);