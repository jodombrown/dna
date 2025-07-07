-- Create platform_settings table for system configuration
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only superadmins can read/write platform settings
CREATE POLICY "Superadmins can manage platform settings" 
  ON public.platform_settings 
  FOR ALL 
  USING (public.get_admin_role(auth.uid()) = 'superadmin');

-- Create trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value, description, category) VALUES
  ('default_user_role', '"user"', 'Default role assigned to new users', 'user_management'),
  ('enable_public_posts', 'true', 'Allow users to create public posts', 'content'),
  ('enable_waitlist_signups', 'true', 'Enable waitlist signup functionality', 'registration'),
  ('max_post_length', '5000', 'Maximum character limit for posts', 'content'),
  ('daily_rate_limit_posts', '10', 'Maximum posts per user per day', 'content'),
  ('daily_rate_limit_comments', '50', 'Maximum comments per user per day', 'content')
ON CONFLICT (setting_key) DO NOTHING;