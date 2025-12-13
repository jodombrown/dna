-- Allow anyone (including unauthenticated users) to read public profiles
CREATE POLICY "public_profiles_viewable_by_anyone" 
ON public.profiles 
FOR SELECT 
USING (is_public = true);

-- Keep existing policy for authenticated users to see their own private profile
-- The existing policy handles: authenticated users can see their own profile OR public profiles