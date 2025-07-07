-- Create admin_logs table for audit logging
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'user', 'post', 'community', 'settings', etc.
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'success', -- 'success', 'failed', 'partial'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_notifications table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'info', 'warning', 'critical', 'success'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info', -- 'info', 'warning', 'critical'
  is_read BOOLEAN DEFAULT false,
  related_resource_type TEXT,
  related_resource_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_resource ON public.admin_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin_id ON public.admin_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread ON public.admin_notifications(admin_id, is_read, created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_logs
CREATE POLICY "Admins can view audit logs" 
  ON public.admin_logs 
  FOR SELECT 
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "System can create audit logs" 
  ON public.admin_logs 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Superadmins can delete audit logs" 
  ON public.admin_logs 
  FOR DELETE 
  USING (public.get_admin_role(auth.uid()) = 'superadmin');

-- RLS Policies for admin_notifications
CREATE POLICY "Admins can view their own notifications" 
  ON public.admin_notifications 
  FOR SELECT 
  USING (admin_id = auth.uid() AND public.is_admin_user(auth.uid()));

CREATE POLICY "System can create admin notifications" 
  ON public.admin_notifications 
  FOR INSERT 
  WITH CHECK (public.is_admin_user(admin_id));

CREATE POLICY "Admins can update their own notifications" 
  ON public.admin_notifications 
  FOR UPDATE 
  USING (admin_id = auth.uid() AND public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete their own notifications" 
  ON public.admin_notifications 
  FOR DELETE 
  USING (admin_id = auth.uid() AND public.is_admin_user(auth.uid()));

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_admin_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'success'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_logs (
    admin_id, action, resource_type, resource_id, 
    details, ip_address, user_agent, status
  ) VALUES (
    p_admin_id, p_action, p_resource_type, p_resource_id,
    p_details, p_ip_address, p_user_agent, p_status
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to create admin notifications
CREATE OR REPLACE FUNCTION public.create_admin_notification(
  p_admin_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_severity TEXT DEFAULT 'info',
  p_related_resource_type TEXT DEFAULT NULL,
  p_related_resource_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.admin_notifications (
    admin_id, type, title, message, severity,
    related_resource_type, related_resource_id
  ) VALUES (
    p_admin_id, p_type, p_title, p_message, p_severity,
    p_related_resource_type, p_related_resource_id
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;