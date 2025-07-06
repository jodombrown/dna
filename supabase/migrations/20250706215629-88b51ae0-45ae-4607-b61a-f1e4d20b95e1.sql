-- Create admin role enum type
CREATE TYPE admin_role AS ENUM ('admin', 'superadmin', 'moderator');

-- Create admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role admin_role NOT NULL DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
      AND is_active = true
  )
$function$;

-- Create function to get admin role
CREATE OR REPLACE FUNCTION public.get_admin_role(_user_id uuid)
RETURNS admin_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT role
  FROM public.admin_users
  WHERE user_id = _user_id
    AND is_active = true
  LIMIT 1
$function$;

-- Create policies for admin_users table
CREATE POLICY "Admin users can view admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Super admins can manage admin users" 
  ON public.admin_users 
  FOR ALL 
  USING (public.get_admin_role(auth.uid()) = 'superadmin');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON public.admin_users(is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();