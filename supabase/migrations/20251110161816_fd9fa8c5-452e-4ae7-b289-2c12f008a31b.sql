-- Fix final 2 functions missing search_path
ALTER FUNCTION public.update_engagement_tracking_updated_at() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;