
-- Fix rpc_check_in_by_token(uuid, text) search path
ALTER FUNCTION public.rpc_check_in_by_token(p_event uuid, p_token text) SET search_path = public;

-- Tighten notifications_insert: only service_role should insert freely
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
CREATE POLICY "notifications_insert"
ON public.notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- Tighten profile_views_insert
DROP POLICY IF EXISTS "profile_views_insert" ON public.profile_views;
CREATE POLICY "profile_views_insert"
ON public.profile_views
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Tighten conversations_new
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations_new;
CREATE POLICY "Users can create conversations"
ON public.conversations_new
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Tighten dia_queries
DROP POLICY IF EXISTS "dia_queries_insert_policy" ON public.dia_queries;
CREATE POLICY "dia_queries_insert_policy"
ON public.dia_queries
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) IS NOT NULL);
