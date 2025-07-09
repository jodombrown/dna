-- Fix multiple permissive policies by making admin policies more specific

-- Drop the broad policy that covers all operations
DROP POLICY IF EXISTS "Admin can view and modify" ON public.admin_users;

-- Create specific policies for each operation
CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT
USING (is_admin_user(auth.uid()));

CREATE POLICY "Superadmins can insert admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (get_admin_role(auth.uid()) = 'superadmin'::admin_role);

CREATE POLICY "Superadmins can update admin users" 
ON public.admin_users 
FOR UPDATE 
USING (get_admin_role(auth.uid()) = 'superadmin'::admin_role);

CREATE POLICY "Superadmins can delete admin users except protected" 
ON public.admin_users 
FOR DELETE 
USING (
  get_admin_role(auth.uid()) = 'superadmin'::admin_role 
  AND NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = admin_users.user_id 
    AND users.email = 'aweh@diasporanetwork.africa'
  )
);

-- Drop the separate protection policy since it's now integrated
DROP POLICY IF EXISTS "Cannot delete protected super admin" ON public.admin_users;