-- Fix the opportunities foreign key issue (PGRST200)
-- Add foreign key constraint to link opportunities.created_by to profiles.id

ALTER TABLE public.opportunities
  DROP CONSTRAINT IF EXISTS opportunities_created_by_fkey;

ALTER TABLE public.opportunities
  ADD CONSTRAINT opportunities_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.profiles(id)
    ON DELETE SET NULL;