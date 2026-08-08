DROP FUNCTION public.rpc_get_guest_registration(uuid);

CREATE FUNCTION public.rpc_get_guest_registration(p_token uuid)
RETURNS TABLE (
  attendee_id uuid,
  event_id uuid,
  event_title text,
  event_format text,
  event_start_time timestamptz,
  endpoints jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ea.id,
    e.id,
    e.title,
    e.format,
    e.start_time,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
         'type', ede.type,
         'provider', ede.provider,
         'join_credential', ede.join_credential
       ))
       FROM public.event_delivery_endpoints ede
       WHERE ede.event_id = e.id),
      '[]'::jsonb
    )
  FROM public.event_guest_registrations gr
  JOIN public.event_attendees ea ON ea.id = gr.attendee_id
  JOIN public.events e ON e.id = ea.event_id
  WHERE gr.magic_link_token = p_token;
$$;

COMMENT ON FUNCTION public.rpc_get_guest_registration(uuid) IS 'BD426 fix. Extended to return event_start_time (for the guest UI to compute the join-window) and endpoints as a jsonb array (physical and/or virtual, hybrid-safe). A guest holding a valid token is, by definition, a confirmed registrant for this specific event; returning join_credential here is the deliberate, scoped equivalent of event_delivery_endpoints'' own confirmed-attendee RLS branch, which a guest cannot satisfy via auth.uid() since they have no session at all.';

-- CREATE FUNCTION auto-grants EXECUTE to PUBLIC on the new function. Revoke it,
-- then restore exactly the grantee list captured before the drop.
REVOKE EXECUTE ON FUNCTION public.rpc_get_guest_registration(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_get_guest_registration(uuid) TO anon, authenticated;
