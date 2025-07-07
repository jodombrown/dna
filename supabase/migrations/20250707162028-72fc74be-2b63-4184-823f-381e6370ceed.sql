-- Fix RLS performance issues by optimizing auth function calls and consolidating policies

-- Drop existing policies to recreate them optimized
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Superadmins can delete audit logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins can view their own notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can update their own notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can delete their own notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Superadmins can manage platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admin users can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;

-- Recreate optimized policies for admin_logs
CREATE POLICY "Admins can view audit logs" 
  ON public.admin_logs 
  FOR SELECT 
  USING (public.is_admin_user((select auth.uid())));

CREATE POLICY "Superadmins can delete audit logs" 
  ON public.admin_logs 
  FOR DELETE 
  USING (public.get_admin_role((select auth.uid())) = 'superadmin');

-- Recreate optimized policies for admin_notifications
CREATE POLICY "Admins can view their own notifications" 
  ON public.admin_notifications 
  FOR SELECT 
  USING (admin_id = (select auth.uid()) AND public.is_admin_user((select auth.uid())));

CREATE POLICY "Admins can update their own notifications" 
  ON public.admin_notifications 
  FOR UPDATE 
  USING (admin_id = (select auth.uid()) AND public.is_admin_user((select auth.uid())));

CREATE POLICY "Admins can delete their own notifications" 
  ON public.admin_notifications 
  FOR DELETE 
  USING (admin_id = (select auth.uid()) AND public.is_admin_user((select auth.uid())));

-- Recreate optimized policy for platform_settings
CREATE POLICY "Superadmins can manage platform settings" 
  ON public.platform_settings 
  FOR ALL 
  USING (public.get_admin_role((select auth.uid())) = 'superadmin');

-- Consolidate admin_users policies into single optimized policy
CREATE POLICY "Admin access policy" 
  ON public.admin_users 
  FOR ALL 
  USING (
    public.is_admin_user((select auth.uid())) OR 
    public.get_admin_role((select auth.uid())) = 'superadmin'
  );

-- Fix other performance issues for commonly used tables
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;

CREATE POLICY "Users can view their own conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (((select auth.uid()) = user_1_id) OR ((select auth.uid()) = user_2_id));

CREATE POLICY "Users can create conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (((select auth.uid()) = user_1_id) OR ((select auth.uid()) = user_2_id));

CREATE POLICY "Users can update their own conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (((select auth.uid()) = user_1_id) OR ((select auth.uid()) = user_2_id));

-- Fix messages policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages they sent" ON public.messages;

CREATE POLICY "Users can view messages in their conversations" 
  ON public.messages 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = messages.conversation_id 
    AND (user_1_id = (select auth.uid()) OR user_2_id = (select auth.uid()))
  ));

CREATE POLICY "Users can create messages in their conversations" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    (select auth.uid()) = sender_id AND 
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = messages.conversation_id 
      AND (user_1_id = (select auth.uid()) OR user_2_id = (select auth.uid()))
    )
  );

CREATE POLICY "Users can update messages they sent" 
  ON public.messages 
  FOR UPDATE 
  USING ((select auth.uid()) = sender_id);

-- Fix contact_requests policies
DROP POLICY IF EXISTS "Users can view requests they sent or received" ON public.contact_requests;
DROP POLICY IF EXISTS "Users can create contact requests" ON public.contact_requests;
DROP POLICY IF EXISTS "Users can update requests they received" ON public.contact_requests;

CREATE POLICY "Users can view requests they sent or received" 
  ON public.contact_requests 
  FOR SELECT 
  USING (((select auth.uid()) = sender_id) OR ((select auth.uid()) = receiver_id));

CREATE POLICY "Users can create contact requests" 
  ON public.contact_requests 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = sender_id);

CREATE POLICY "Users can update requests they received" 
  ON public.contact_requests 
  FOR UPDATE 
  USING ((select auth.uid()) = receiver_id);

-- Fix notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING ((select auth.uid()) = user_id);