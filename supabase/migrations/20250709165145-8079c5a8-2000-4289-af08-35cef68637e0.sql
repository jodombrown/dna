-- Fix remaining multiple permissive policies by making super admin protection restrictive

-- Drop the current DELETE policy and recreate as restrictive
DROP POLICY IF EXISTS "Cannot delete protected super admin" ON public.admin_users;

CREATE POLICY "Cannot delete protected super admin" 
ON public.admin_users 
FOR DELETE
AS RESTRICTIVE
USING (
  NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = admin_users.user_id 
    AND users.email = 'aweh@diasporanetwork.africa'
  )
);