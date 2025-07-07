-- Fix security warnings by setting immutable search path for audit functions

-- Update create_audit_log function with SET search_path
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
SET search_path = 'public'
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

-- Update create_admin_notification function with SET search_path
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
SET search_path = 'public'
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