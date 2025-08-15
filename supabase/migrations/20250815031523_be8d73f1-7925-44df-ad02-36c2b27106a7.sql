-- Add case-insensitive unique index for usernames
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_ci_idx ON public.profiles (lower(username));

-- Update RLS policies for profiles table to ensure users can only update their own username
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);