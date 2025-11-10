-- Add search_path to all security definer functions missing it
-- This prevents SQL injection through search_path manipulation

ALTER FUNCTION public.create_notification(uuid, text, text, text, text, uuid) SET search_path = public;
ALTER FUNCTION public.find_orphaned_profiles() SET search_path = public;
ALTER FUNCTION public.flag_content(text, uuid, text) SET search_path = public;
ALTER FUNCTION public.get_event_attendees(uuid, rsvp_status) SET search_path = public;
ALTER FUNCTION public.get_event_details(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.get_events(uuid, text, event_type, event_format, text, text, integer, integer) SET search_path = public;
ALTER FUNCTION public.get_post_share_count(uuid) SET search_path = public;