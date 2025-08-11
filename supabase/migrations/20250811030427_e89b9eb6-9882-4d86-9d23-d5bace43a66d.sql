-- Set explicit search_path for flagged functions to harden against hijacking
ALTER FUNCTION public.gen_join_token() SET search_path TO 'public';

-- rpc_event_register overloads
ALTER FUNCTION public.rpc_event_register(uuid) SET search_path TO 'public';
ALTER FUNCTION public.rpc_event_register(uuid, jsonb, uuid) SET search_path TO 'public';
ALTER FUNCTION public.rpc_event_register(uuid, uuid, uuid, jsonb) SET search_path TO 'public';

-- approval workflow helpers
ALTER FUNCTION public.rpc_event_approve(uuid) SET search_path TO 'public';
ALTER FUNCTION public.rpc_event_decline(uuid) SET search_path TO 'public';