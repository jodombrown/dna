-- BD490 follow-up: enforce_publish_delivery_endpoint_gate() is SECURITY
-- DEFINER and CREATE FUNCTION auto-grants EXECUTE to PUBLIC. It only needs
-- to run as a trigger (invoked by the table owner, not by a role calling it
-- directly), so revoke the direct-call grant — same pattern as every other
-- SECURITY DEFINER trigger function in this schema (enforce_org_privileged_columns,
-- enforce_profile_privileged_columns, notify_event_dates_announced).
REVOKE EXECUTE ON FUNCTION public.enforce_publish_delivery_endpoint_gate() FROM anon, authenticated, PUBLIC;
