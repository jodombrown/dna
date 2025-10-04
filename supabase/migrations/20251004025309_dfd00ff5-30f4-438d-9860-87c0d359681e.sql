-- Create storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-logos',
  'organization-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
);

-- RLS policies for organization logos
CREATE POLICY "Organization logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-logos');

CREATE POLICY "Org owners can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organization-logos' 
  AND auth.uid() IN (
    SELECT owner_user_id FROM public.organizations 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Org owners can update their logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'organization-logos'
  AND auth.uid() IN (
    SELECT owner_user_id FROM public.organizations 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Org owners can delete their logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'organization-logos'
  AND auth.uid() IN (
    SELECT owner_user_id FROM public.organizations 
    WHERE id::text = (storage.foldername(name))[1]
  )
);