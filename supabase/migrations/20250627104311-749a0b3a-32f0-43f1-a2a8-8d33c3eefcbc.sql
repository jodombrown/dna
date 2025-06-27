
-- Fix security warnings by setting immutable search paths for functions

-- Update get_current_user_profile function with SET search_path
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
 RETURNS TABLE(user_id uuid, is_public boolean)
 LANGUAGE sql
 SET search_path = 'public'
AS $function$
SELECT id, COALESCE((bio IS NOT NULL AND bio != ''), false) as is_public
FROM public.profiles 
WHERE id = auth.uid();
$function$;

-- Update check_rate_limit function with SET search_path  
CREATE OR REPLACE FUNCTION public.check_rate_limit(_ip_address inet, _submission_type text, _max_submissions integer DEFAULT 5, _time_window_minutes integer DEFAULT 60)
 RETURNS boolean
 LANGUAGE sql
 SET search_path = 'public'
AS $function$
SELECT COUNT(*) < _max_submissions
FROM public.form_submissions
WHERE ip_address = _ip_address
  AND submission_type = _submission_type
  AND created_at > (now() - (_time_window_minutes || ' minutes')::interval);
$function$;

-- Update has_role function with SET search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
    role_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    ) INTO role_exists;

    RETURN role_exists;
END;
$function$;
