BEGIN;

-- Fix mutable search_path by setting it explicitly to 'public'
CREATE OR REPLACE FUNCTION public.check_rate_limit_uid(p_user uuid, p_action text, p_limit integer, p_window_seconds integer)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  -- For now, use posts as an example action bucket
  select count(*) < p_limit
  from public.posts
  where author_id = p_user and created_at > now() - make_interval(secs => p_window_seconds)
$function$;

CREATE OR REPLACE FUNCTION public.reject_html(_txt text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  select coalesce(_txt, '') !~* '<\\/?[a-z][^>]*>'
$function$;

COMMIT;