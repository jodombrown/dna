-- Targeted fix: wrap auth.* calls with (SELECT ...) for known policies with confirmed schemas

-- error_logs: Admins can view error logs
ALTER POLICY "Admins can view error logs" ON public.error_logs
  USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- content_moderation: Admins manage content moderation (apply to all with USING and WITH CHECK)
ALTER POLICY "Admins manage content moderation" ON public.content_moderation
  USING (has_role((SELECT auth.uid()), 'admin'::app_role))
  WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

-- adin_signals: Users can view and update their own signals (ALL)
ALTER POLICY "Users can view and update their own signals" ON public.adin_signals
  USING (user_id = (SELECT auth.uid()) OR has_role((SELECT auth.uid()), 'admin'::app_role))
  WITH CHECK (user_id = (SELECT auth.uid()) OR has_role((SELECT auth.uid()), 'admin'::app_role));

-- event_blasts: Event creators manage blasts (ALL)
ALTER POLICY "Event creators manage blasts" ON public.event_blasts
  USING (
    event_id IN (
      SELECT id FROM public.events WHERE created_by = (SELECT auth.uid())
    ) OR has_role((SELECT auth.uid()), 'admin'::app_role)
  )
  WITH CHECK (
    event_id IN (
      SELECT id FROM public.events WHERE created_by = (SELECT auth.uid())
    ) OR has_role((SELECT auth.uid()), 'admin'::app_role)
  );

-- event_analytics: Event creators view analytics (SELECT only)
ALTER POLICY "Event creators view analytics" ON public.event_analytics
  USING (
    event_id IN (
      SELECT id FROM public.events WHERE created_by = (SELECT auth.uid())
    ) OR has_role((SELECT auth.uid()), 'admin'::app_role)
  );

-- event_checkins: Event staff manage checkins (ALL)
ALTER POLICY "Event staff manage checkins" ON public.event_checkins
  USING (
    registration_id IN (
      SELECT r.id FROM public.event_registrations r
      JOIN public.events e ON e.id = r.event_id
      WHERE e.created_by = (SELECT auth.uid())
    ) OR has_role((SELECT auth.uid()), 'admin'::app_role)
  )
  WITH CHECK (
    registration_id IN (
      SELECT r.id FROM public.event_registrations r
      JOIN public.events e ON e.id = r.event_id
      WHERE e.created_by = (SELECT auth.uid())
    ) OR has_role((SELECT auth.uid()), 'admin'::app_role)
  );