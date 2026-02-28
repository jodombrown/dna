
-- Drop the overly permissive update policy (RPCs handle analytics via SECURITY DEFINER)
DROP POLICY "Users can increment placement analytics" ON public.sponsor_placements;
