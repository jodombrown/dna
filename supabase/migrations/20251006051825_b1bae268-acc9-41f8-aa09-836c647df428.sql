-- Fix onboarding failure: profiles update trigger referenced non-existent column NEW.role
-- Update function to guard changes to is_admin and roles only, requiring admin via has_role()
CREATE OR REPLACE FUNCTION public.prevent_non_admin_profile_privilege_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Block non-admins from changing privileged fields on profiles
  IF (
    COALESCE(NEW.is_admin, false) IS DISTINCT FROM COALESCE(OLD.is_admin, false)
    OR COALESCE(NEW.roles, ARRAY[]::text[]) IS DISTINCT FROM COALESCE(OLD.roles, ARRAY[]::text[])
  ) AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can change privileged profile fields';
  END IF;

  RETURN NEW;
END;
$$;