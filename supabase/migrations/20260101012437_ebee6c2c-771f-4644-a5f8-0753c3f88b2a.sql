-- Add slug column to posts table for readable URLs
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug (allowing nulls for backward compatibility)
CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_unique_idx ON public.posts (slug) WHERE slug IS NOT NULL;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(trim(title));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Truncate to reasonable length
  base_slug := left(base_slug, 80);
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.posts WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Generate slugs for existing posts that have titles but no slugs
UPDATE public.posts 
SET slug = public.generate_slug(title)
WHERE title IS NOT NULL 
  AND title != '' 
  AND slug IS NULL;

-- Create trigger to auto-generate slug on insert
CREATE OR REPLACE FUNCTION public.posts_generate_slug_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only generate slug if title exists and slug is not provided
  IF NEW.title IS NOT NULL AND NEW.title != '' AND (NEW.slug IS NULL OR NEW.slug = '') THEN
    NEW.slug := public.generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS posts_auto_slug ON public.posts;
CREATE TRIGGER posts_auto_slug
  BEFORE INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.posts_generate_slug_trigger();