
-- Create admin roles and permissions system
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'content_moderator', 'analytics_viewer', 'user_manager', 'event_manager');

-- Create admin_users table for admin management
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role admin_role NOT NULL DEFAULT 'analytics_viewer',
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(user_id)
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
      AND is_active = true
  )
$$;

-- Create function to get admin role
CREATE OR REPLACE FUNCTION public.get_admin_role(_user_id uuid)
RETURNS admin_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.admin_users
  WHERE user_id = _user_id
    AND is_active = true
  LIMIT 1
$$;

-- Admin users can view other admin users if they are super_admin
CREATE POLICY "Super admins can view all admin users"
  ON public.admin_users
  FOR SELECT
  USING (public.get_admin_role((select auth.uid())) = 'super_admin' OR user_id = (select auth.uid()));

-- Only super admins can insert new admin users
CREATE POLICY "Super admins can insert admin users"
  ON public.admin_users
  FOR INSERT
  WITH CHECK (public.get_admin_role((select auth.uid())) = 'super_admin');

-- Only super admins can update admin users
CREATE POLICY "Super admins can update admin users"
  ON public.admin_users
  FOR UPDATE
  USING (public.get_admin_role((select auth.uid())) = 'super_admin');

-- Only super admins can delete admin users
CREATE POLICY "Super admins can delete admin users"
  ON public.admin_users
  FOR DELETE
  USING (public.get_admin_role((select auth.uid())) = 'super_admin');

-- Create audit log table for admin actions
CREATE TABLE public.admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_type TEXT, -- 'user', 'post', 'community', 'system'
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can view audit logs based on their role
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_log
  FOR SELECT
  USING (public.is_admin_user((select auth.uid())));

-- Insert initial super admin (you'll need to update this with your actual user ID)
-- This is commented out - you'll need to run this manually with your user ID
-- INSERT INTO public.admin_users (user_id, role, is_active, created_at)
-- VALUES ('YOUR_USER_ID_HERE', 'super_admin', true, now());
