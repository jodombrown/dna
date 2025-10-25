
-- Fix search_path for the new notification functions
ALTER FUNCTION public.notify_post_like() SET search_path = public;
ALTER FUNCTION public.notify_post_comment() SET search_path = public;
ALTER FUNCTION public.notify_new_connection() SET search_path = public;
