-- Make organizer_id nullable so curated events don't need a profile
ALTER TABLE public.events ALTER COLUMN organizer_id DROP NOT NULL;