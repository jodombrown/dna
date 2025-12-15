-- Drop the broken get_user_connections function that uses wrong column names (c.a, c.b)
-- Keep the working version that uses (c.requester_id, c.recipient_id)
DROP FUNCTION IF EXISTS public.get_user_connections(uuid, integer, integer);

-- Verify the remaining function works correctly
COMMENT ON FUNCTION public.get_user_connections(uuid, text, integer, integer) 
IS 'Returns accepted connections for a user. Uses requester_id/recipient_id columns correctly.';