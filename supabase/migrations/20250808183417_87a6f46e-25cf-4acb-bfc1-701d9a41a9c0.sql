BEGIN;

ALTER VIEW public.v_feed_ordered SET (security_invoker = true);

COMMIT;