-- Harden notifications schema to satisfy all writers
-- Add missing columns used by various functions
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS body text,
  ADD COLUMN IF NOT EXISTS related_entity_id uuid,
  ADD COLUMN IF NOT EXISTS related_entity_type text,
  ADD COLUMN IF NOT EXISTS payload jsonb,
  ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS read boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Keep read and is_read in sync automatically
CREATE OR REPLACE FUNCTION public.notifications_sync_read()
RETURNS trigger AS $$
BEGIN
  NEW.is_read := COALESCE(NEW.is_read, NEW.read, false);
  NEW.read := COALESCE(NEW.read, NEW.is_read, false);
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';

DROP TRIGGER IF EXISTS trg_notifications_sync_read ON public.notifications;
CREATE TRIGGER trg_notifications_sync_read
BEFORE INSERT OR UPDATE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.notifications_sync_read();