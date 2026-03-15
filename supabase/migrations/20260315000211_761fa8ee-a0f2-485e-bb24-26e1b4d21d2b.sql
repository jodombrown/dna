
-- 1. Create sponsor-logos storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('sponsor-logos', 'sponsor-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS policies for sponsor-logos bucket
CREATE POLICY "Anyone can view sponsor logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'sponsor-logos');

CREATE POLICY "Authenticated users can upload sponsor logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'sponsor-logos');

CREATE POLICY "Authenticated users can update sponsor logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'sponsor-logos');

CREATE POLICY "Authenticated users can delete sponsor logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'sponsor-logos');

-- 3. Add status column to sponsor_placements
ALTER TABLE public.sponsor_placements
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft'
CHECK (status IN ('draft', 'active', 'paused'));

-- 4. Set existing active placements to 'active' status
UPDATE public.sponsor_placements SET status = 'active' WHERE is_active = true;
