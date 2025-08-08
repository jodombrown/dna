-- Fix initplan warning on opportunities SELECT policy by wrapping auth.uid() in SELECT
DROP POLICY IF EXISTS "Active public opportunities are viewable by everyone" ON public.opportunities;
CREATE POLICY "Active public opportunities are viewable by everyone"
ON public.opportunities
FOR SELECT
USING (
  ((visibility = 'public') AND (status = 'active'))
  OR EXISTS (
    SELECT 1 FROM public.collaboration_memberships m
    WHERE m.space_id = opportunities.space_id
      AND m.user_id = (SELECT auth.uid())
      AND m.status = 'approved'
  )
);