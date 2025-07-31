-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for role column for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Update admin users to have admin role based on existing admin_users table
UPDATE public.profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT user_id FROM public.admin_users WHERE is_active = true
);

-- Create security definer function to get user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role = 'admin' FROM public.profiles WHERE id = user_id;
$$;

-- Update RLS policies for posts table
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts or admins can delete any" 
ON public.posts FOR DELETE 
USING (
  author_id = auth.uid() OR 
  public.is_user_admin(auth.uid())
);

-- Update RLS policies for communities table  
DROP POLICY IF EXISTS "Users can delete own communities" ON public.communities;
CREATE POLICY "Users can delete own communities or admins can delete any" 
ON public.communities FOR DELETE 
USING (
  created_by = auth.uid() OR 
  public.is_user_admin(auth.uid())
);

-- Update RLS policies for comments table
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments or admins can delete any" 
ON public.comments FOR DELETE 
USING (
  author_id = auth.uid() OR 
  public.is_user_admin(auth.uid())
);

-- Create admin-only policy for beta_feedback access
DROP POLICY IF EXISTS "Beta feedback access policy" ON public.beta_feedback;
CREATE POLICY "Users can create and view own feedback, admins can view all" 
ON public.beta_feedback FOR SELECT 
USING (
  user_id = auth.uid() OR 
  public.is_user_admin(auth.uid())
);

-- Create admin-only policy for invites management
DROP POLICY IF EXISTS "Admins can create invites" ON public.invites;
CREATE POLICY "Admins can create invites or users with limits" 
ON public.invites FOR INSERT 
WITH CHECK (
  public.is_user_admin(auth.uid()) OR 
  (
    created_by = auth.uid() AND 
    (SELECT COUNT(*) FROM public.invites WHERE created_by = auth.uid()) < 5
  )
);

-- Add admin visibility policy for event registrations analytics
CREATE POLICY "Admins can view all event registrations" 
ON public.event_registrations FOR SELECT 
USING (
  user_id = auth.uid() OR 
  public.is_user_admin(auth.uid())
);

-- Create admin content moderation table
CREATE TABLE IF NOT EXISTS public.content_moderation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL, -- 'post', 'comment', 'community', etc.
  content_id uuid NOT NULL,
  action text NOT NULL, -- 'flag', 'hide', 'remove', 'approve'
  reason text,
  moderator_id uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed'))
);

-- Enable RLS on content moderation
ALTER TABLE public.content_moderation ENABLE ROW LEVEL SECURITY;

-- Only admins can access content moderation
CREATE POLICY "Only admins can access content moderation" 
ON public.content_moderation FOR ALL 
USING (public.is_user_admin(auth.uid()));

-- Create admin analytics table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.admin_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES public.profiles(id),
  action_type text NOT NULL,
  target_type text,
  target_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin analytics
ALTER TABLE public.admin_analytics ENABLE ROW LEVEL SECURITY;

-- Only admins can access admin analytics
CREATE POLICY "Only admins can access admin analytics" 
ON public.admin_analytics FOR ALL 
USING (public.is_user_admin(auth.uid()));