-- Add banner customization columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS banner_type text DEFAULT 'gradient',
  ADD COLUMN IF NOT EXISTS banner_gradient text DEFAULT 'dna',
  ADD COLUMN IF NOT EXISTS banner_overlay boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS avatar_position jsonb DEFAULT '{"x": 0.5, "y": 0.5, "zoom": 1}'::jsonb;

COMMENT ON COLUMN profiles.banner_type IS 'Type: gradient, solid, or image';
COMMENT ON COLUMN profiles.banner_gradient IS 'Gradient name if type=gradient (dna, cultural, sunset, ocean, earth, night, gold, ruby)';
COMMENT ON COLUMN profiles.banner_overlay IS 'Dark overlay for text contrast on banner';
COMMENT ON COLUMN profiles.avatar_position IS 'Avatar crop position and zoom level {x, y, zoom}';

-- Ensure banners storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for banners bucket
CREATE POLICY "Users can upload own banner"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own banner"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');