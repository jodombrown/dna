-- ============================================================
-- Five C's Pulse — all-time totals RPC
-- ============================================================
-- Composer audit, Phase B (no dead number renders).
--
-- get_five_cs_pulse(window) reports a rolling-window count only:
-- it accepts '24h' | '7d' | '30d' and has no all-time mode, and
-- pulse_metrics_daily is deliberately capped at 30 days. At ~20
-- members most pillars read a TRUE zero in the window on most
-- days, so the compass needs a second, honest fact alongside the
-- window count: how much has ever happened in each pillar.
--
-- This reads that total directly from activity_events (no window
-- filter), using the SAME event_type -> c_module mapping as
-- get_five_cs_pulse so the two numbers describe the same buckets.
-- It does NOT widen the pulse window — the window query is
-- unchanged; this is a separate all-time count.
--
-- SECURITY DEFINER because platform scope must sum across all
-- members, and the activity_events RLS policy limits an
-- authenticated client to its own rows. User scope is pinned to
-- the caller (or the supplied p_user_id) exactly as the window
-- RPC does. Every pillar is returned, including the ones with a
-- zero total, so the client can tell "zero this window" from
-- "zero ever".
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_five_cs_pulse_totals(
  p_scope TEXT DEFAULT 'platform',
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  c_module TEXT,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF p_scope = 'user' THEN
    v_user_id := COALESCE(p_user_id, auth.uid());
    IF v_user_id IS NULL THEN
      RAISE EXCEPTION 'User scope requires authenticated user or p_user_id';
    END IF;
  END IF;

  RETURN QUERY
  WITH event_to_c AS (
    SELECT
      CASE
        WHEN ae.event_type IN ('connection_request','connection_accepted','profile_updated','profile_view') THEN 'connect'
        WHEN ae.event_type IN ('event_created','event_rsvp','event_published') THEN 'convene'
        WHEN ae.event_type IN ('space_created','space_joined','space_message','task_completed') THEN 'collaborate'
        WHEN ae.event_type IN ('opportunity_created','opportunity_application','opportunity_thread_message') THEN 'contribute'
        WHEN ae.event_type IN ('post_created','comment_created','reaction_created','story_created') THEN 'convey'
        ELSE 'other'
      END AS c_mod
    FROM public.activity_events ae
    WHERE (p_scope = 'platform' OR ae.user_id = v_user_id)
  ),
  totals AS (
    SELECT etc.c_mod, COUNT(*)::BIGINT AS events
    FROM event_to_c etc
    WHERE etc.c_mod <> 'other'
    GROUP BY etc.c_mod
  ),
  all_cs AS (
    SELECT unnest(ARRAY['connect','convene','collaborate','contribute','convey']) AS c_mod
  )
  SELECT
    ac.c_mod AS c_module,
    COALESCE(t.events, 0) AS total_count
  FROM all_cs ac
  LEFT JOIN totals t ON t.c_mod = ac.c_mod;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_five_cs_pulse_totals(TEXT, UUID) TO authenticated;
