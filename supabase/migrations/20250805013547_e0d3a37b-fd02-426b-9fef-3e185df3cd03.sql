-- Create embed providers table
CREATE TABLE public.embed_providers (
  id SERIAL PRIMARY KEY,
  provider_name TEXT NOT NULL UNIQUE,
  endpoint_url TEXT NOT NULL
);

-- Add embed_metadata column to posts table
ALTER TABLE public.posts
ADD COLUMN embed_metadata JSONB;

-- Add constraint to validate embed_metadata JSON schema
ALTER TABLE public.posts
ADD CONSTRAINT embed_metadata_schema_check
CHECK (
  embed_metadata IS NULL OR
  jsonb_typeof(embed_metadata) = 'object'
);

-- Insert some common embed providers
INSERT INTO public.embed_providers (provider_name, endpoint_url) VALUES
('noembed', 'https://noembed.com/embed'),
('oembed', 'https://oembed.com/embed');

-- Enable RLS on embed_providers
ALTER TABLE public.embed_providers ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read embed providers
CREATE POLICY "Everyone can view embed providers"
ON public.embed_providers
FOR SELECT
TO public
USING (true);