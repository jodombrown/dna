-- Remove the duplicate policy that was just created
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Now check what policies we actually have
-- The goal is to have secure, non-conflicting policies that protect user data

-- Ensure we don't have any overly broad policies
-- If there are still public readable policies, they need to be restricted