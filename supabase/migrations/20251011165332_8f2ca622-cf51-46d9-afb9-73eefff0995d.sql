-- Fix events.created_by foreign key and ensure profile exists before insert
-- 1) Drop incorrect FK (likely referencing a non-existent public.users table)
ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_created_by_fkey;

-- 2) Ensure created_by column is UUID and not null (keep existing if already set)
-- Note: We do not change nullability here to avoid data impact; assumes current schema is correct
-- ALTER TABLE public.events ALTER COLUMN created_by SET NOT NULL; -- commented intentionally

-- 3) Add correct FK to public.profiles(id)
ALTER TABLE public.events
  ADD CONSTRAINT events_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES public.profiles(id)
  ON DELETE RESTRICT;

-- 4) Helpful index for queries
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- 5) Create a BEFORE INSERT trigger to ensure a profile row exists for creator
CREATE OR REPLACE FUNCTION public.ensure_profile_on_event_insert()
RETURNS trigger AS $$
BEGIN
  -- Ensure a profile exists for the user creating the event
  PERFORM public.ensure_profile_for_user(NEW.created_by, NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_events_ensure_profile ON public.events;
CREATE TRIGGER trg_events_ensure_profile
BEFORE INSERT ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.ensure_profile_on_event_insert();