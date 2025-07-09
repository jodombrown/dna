-- Fix auth RLS performance issues by optimizing auth.uid() calls

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Superadmins can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Superadmins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Superadmins can delete admin users except protected" ON public.admin_users;

-- Recreate policies with optimized auth.uid() calls
CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT
USING (is_admin_user((SELECT auth.uid())));

CREATE POLICY "Superadmins can insert admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (get_admin_role((SELECT auth.uid())) = 'superadmin'::admin_role);

CREATE POLICY "Superadmins can update admin users" 
ON public.admin_users 
FOR UPDATE 
USING (get_admin_role((SELECT auth.uid())) = 'superadmin'::admin_role);

CREATE POLICY "Superadmins can delete admin users except protected" 
ON public.admin_users 
FOR DELETE 
USING (
  get_admin_role((SELECT auth.uid())) = 'superadmin'::admin_role 
  AND NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = admin_users.user_id 
    AND users.email = 'aweh@diasporanetwork.africa'
  )
);