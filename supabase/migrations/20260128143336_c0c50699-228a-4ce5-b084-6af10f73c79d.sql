-- Fix security definer functions by setting explicit search_path
-- This prevents potential schema hijacking attacks

-- Fix get_mutual_connection_count
ALTER FUNCTION public.get_mutual_connection_count(uuid, uuid) SET search_path = public;

-- Fix get_mutual_connections (both overloads)
DO $$
DECLARE
  func_oid oid;
BEGIN
  -- Find and alter all overloads of get_mutual_connections
  FOR func_oid IN 
    SELECT p.oid FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = 'get_mutual_connections'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', func_oid::regprocedure);
  END LOOP;
END $$;

-- Fix get_universal_feed
ALTER FUNCTION public.get_universal_feed(
  p_viewer_id uuid,
  p_tab text,
  p_author_id uuid,
  p_space_id uuid,
  p_event_id uuid,
  p_limit int,
  p_offset int,
  p_ranking_mode text
) SET search_path = public;

-- Add comment documenting the security fix
COMMENT ON FUNCTION public.get_mutual_connection_count(uuid, uuid) IS 
'Returns count of mutual connections between two users. Security: search_path set to public.';

COMMENT ON FUNCTION public.get_universal_feed(uuid, text, uuid, uuid, uuid, int, int, text) IS 
'Returns paginated universal feed for a viewer. Security: search_path set to public.';