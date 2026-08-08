ALTER TABLE public.event_attendees ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.event_attendees DROP CONSTRAINT unique_event_attendee;
CREATE UNIQUE INDEX unique_event_attendee_member ON public.event_attendees (event_id, user_id) WHERE user_id IS NOT NULL;

COMMENT ON INDEX public.unique_event_attendee_member IS 'BD426 fix. Replaces unique_event_attendee (which required user_id NOT NULL, blocking guest rows entirely). Preserves one-RSVP-per-Member via the partial WHERE clause; guest rows (user_id null) are unconstrained by this index since NULL is never treated as a duplicate.';
