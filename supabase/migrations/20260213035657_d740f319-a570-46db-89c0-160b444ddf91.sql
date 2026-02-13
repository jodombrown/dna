
-- Fix nudges policies (columns: sent_by, target_user_id)
DROP POLICY IF EXISTS "Users can see nudges they sent or received" ON public.nudges;
DROP POLICY IF EXISTS "Authorized users can send nudges" ON public.nudges;

CREATE POLICY "Users can see nudges they sent or received" ON public.nudges FOR SELECT USING (
  (select auth.uid()) = sent_by OR (select auth.uid()) = target_user_id
);

CREATE POLICY "Authorized users can send nudges" ON public.nudges FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = sent_by);

-- Fix space_activity_log policy
DROP POLICY IF EXISTS "Activity visible to space members" ON public.space_activity_log;

CREATE POLICY "Activity visible to space members" ON public.space_activity_log FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.collaboration_memberships cm
    WHERE cm.space_id = space_activity_log.space_id AND cm.user_id = (select auth.uid()) AND cm.status = 'active'
  )
);
