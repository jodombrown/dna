-- Relax the valid_location check constraint to allow virtual/hybrid events without physical location
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS valid_location;

ALTER TABLE public.events ADD CONSTRAINT valid_location CHECK (
  format = 'virtual' OR (location_name IS NOT NULL OR location_city IS NOT NULL)
);