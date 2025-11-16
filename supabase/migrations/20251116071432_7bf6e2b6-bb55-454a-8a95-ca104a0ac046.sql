-- Create is_admin helper function and fix ada_experiment_assignments policies

-- Create the is_admin function (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Fix ada_experiment_assignments policies
DROP POLICY IF EXISTS "View own assignments or all as admin" ON public.ada_experiment_assignments;
DROP POLICY IF EXISTS "Admins can manage assignments" ON public.ada_experiment_assignments;
DROP POLICY IF EXISTS "Admins can view all assignments" ON public.ada_experiment_assignments;
DROP POLICY IF EXISTS "Users can view their own assignments" ON public.ada_experiment_assignments;
DROP POLICY IF EXISTS "System can create assignments" ON public.ada_experiment_assignments;

-- Single SELECT policy: users see their own, admins see all
CREATE POLICY "View assignments (own or all as admin)"
ON public.ada_experiment_assignments FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- Admin-only management policies
CREATE POLICY "Admins can insert assignments"
ON public.ada_experiment_assignments FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update assignments"
ON public.ada_experiment_assignments FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete assignments"
ON public.ada_experiment_assignments FOR DELETE
TO authenticated
USING (public.is_admin());