-- Add curated event fields to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_curated BOOLEAN DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS curated_source TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS curated_source_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS curated_at TIMESTAMPTZ;