
-- Create a bucket for event images (public: true)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Add banner_url column to events table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'banner_url') THEN
    ALTER TABLE public.events ADD COLUMN banner_url TEXT;
  END IF;
END $$;

-- Storage policies: allow anyone to view, only image owner to write/delete
CREATE POLICY "Anyone can view event images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

CREATE POLICY "Users can upload their own event images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-images'
    AND (select auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own event images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'event-images'
    AND (select auth.uid())::text = (storage.foldername(name))[1]
  );
  
CREATE POLICY "Users can delete their own event images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'event-images'
    AND (select auth.uid())::text = (storage.foldername(name))[1]
  );
