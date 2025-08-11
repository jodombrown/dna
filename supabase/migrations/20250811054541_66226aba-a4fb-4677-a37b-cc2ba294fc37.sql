-- Fix linter: make view run with caller permissions (security_invoker) and harden with security_barrier
-- This ensures the view respects RLS of the querying role

-- Use explicit schema qualification
ALTER VIEW IF EXISTS public.public_profile SET (security_invoker = true);
ALTER VIEW IF EXISTS public.public_profile SET (security_barrier = true);

-- Ensure read access is explicitly granted to typical frontend roles
GRANT SELECT ON public.public_profile TO anon, authenticated;