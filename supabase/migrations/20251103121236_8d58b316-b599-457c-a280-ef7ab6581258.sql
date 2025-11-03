-- Simplify events SELECT policy to break recursion and fix typo
DROP POLICY IF EXISTS "Users can view accessible events" ON public.events;

CREATE POLICY "Users can view accessible events"
ON public.events
FOR SELECT
TO public
USING (
  is_public = true OR organizer_id = auth.uid()
);
