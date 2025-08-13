-- Fix profiles RLS performance and duplication
-- 1) Remove duplicate/permissive policies and auth.uid() direct calls
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_owner ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS profiles_update_owner ON public.profiles;
DROP POLICY IF EXISTS profiles_select_owner ON public.profiles;

-- 2) Recreate consolidated, efficient policies using (select auth.uid())
CREATE POLICY profiles_insert_owner
ON public.profiles
FOR INSERT
TO public
WITH CHECK ((id = (select auth.uid())));

CREATE POLICY profiles_select_owner
ON public.profiles
FOR SELECT
TO public
USING ((id = (select auth.uid())));

CREATE POLICY profiles_update_owner
ON public.profiles
FOR UPDATE
TO public
USING ((id = (select auth.uid())))
WITH CHECK ((id = (select auth.uid())));
