-- Fix is_admin_user function to use user_roles table instead of admin_users

DROP FUNCTION IF EXISTS public.is_admin_user(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = _user_id 
      AND role = 'admin'
  );
$$;