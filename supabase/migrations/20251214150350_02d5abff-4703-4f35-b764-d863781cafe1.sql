-- Fix 1: Optimize notifications_delete policy to use (select auth.uid())
DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;
CREATE POLICY "notifications_delete" ON public.notifications 
FOR DELETE USING ((select auth.uid()) = user_id);

-- Fix 2: Consolidate duplicate message_reactions DELETE policies
DROP POLICY IF EXISTS "Users can delete their own message reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can remove their own reactions" ON public.message_reactions;
CREATE POLICY "message_reactions_delete" ON public.message_reactions 
FOR DELETE USING ((select auth.uid()) = user_id);

-- Fix 3: Consolidate duplicate message_reactions INSERT policies
DROP POLICY IF EXISTS "Users can add reactions to messages in their conversations" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can create message reactions" ON public.message_reactions;
CREATE POLICY "message_reactions_insert" ON public.message_reactions 
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Fix 4: Consolidate duplicate profiles SELECT policies
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "public_profiles_viewable_by_anyone" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles 
FOR SELECT USING (is_public = true OR (select auth.uid()) = id);