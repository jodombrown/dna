
-- Fix security warnings by setting immutable search paths for functions

-- Update is_admin_user function with SET search_path
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
      AND is_active = true
  )
$function$;

-- Update get_admin_role function with SET search_path
CREATE OR REPLACE FUNCTION public.get_admin_role(_user_id uuid)
 RETURNS admin_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role
  FROM public.admin_users
  WHERE user_id = _user_id
    AND is_active = true
  LIMIT 1
$function$;
