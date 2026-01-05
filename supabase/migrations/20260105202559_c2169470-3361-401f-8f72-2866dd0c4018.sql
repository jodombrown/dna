-- Add slug column to events table for SEO-friendly URLs
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug) WHERE slug IS NOT NULL;

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_event_slug(title TEXT, event_year INTEGER DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base slug from title
  base_slug := lower(trim(title));
  base_slug := regexp_replace(base_slug, '[^\w\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := left(base_slug, 100);
  
  -- Append year if provided
  IF event_year IS NOT NULL THEN
    base_slug := base_slug || '-' || event_year::TEXT;
  END IF;
  
  -- Check for duplicates and append counter if needed
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM events WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;