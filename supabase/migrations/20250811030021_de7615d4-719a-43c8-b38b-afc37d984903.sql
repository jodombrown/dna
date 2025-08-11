-- Consolidate events SELECT policies to a single policy for performance
-- Drop overly broad duplicate policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='events' AND policyname='events_public_read'
  ) THEN
    EXECUTE 'DROP POLICY "events_public_read" ON public.events';
  END IF;
END$$;

-- Ensure member access policy uses consolidated, efficient condition
ALTER POLICY "events_member_access"
ON public.events
USING (
  visibility = 'public'
  OR (visibility = 'members' AND (SELECT auth.uid()) IS NOT NULL)
  OR created_by = (SELECT auth.uid())
);