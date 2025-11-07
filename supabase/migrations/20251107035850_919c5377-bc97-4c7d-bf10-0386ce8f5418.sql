-- Create adin_preferences table for user notification settings
CREATE TABLE IF NOT EXISTS public.adin_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  notification_frequency TEXT DEFAULT 'normal' CHECK (notification_frequency IN ('never', 'low', 'normal', 'high')),
  nudge_categories JSONB DEFAULT '["connection", "content", "engagement"]'::jsonb,
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.adin_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own preferences
CREATE POLICY "Users can view own ADIN preferences"
  ON public.adin_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ADIN preferences"
  ON public.adin_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ADIN preferences"
  ON public.adin_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all preferences
CREATE POLICY "Admins can view all ADIN preferences"
  ON public.adin_preferences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email LIKE '%@diasporanetwork.africa'
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_adin_preferences_user_id ON public.adin_preferences(user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_adin_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_adin_preferences_timestamp
  BEFORE UPDATE ON public.adin_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_adin_preferences_updated_at();

-- Function to get or create user preferences
CREATE OR REPLACE FUNCTION public.get_or_create_adin_preferences(p_user_id UUID)
RETURNS SETOF public.adin_preferences AS $$
BEGIN
  -- Try to insert default preferences if they don't exist
  INSERT INTO public.adin_preferences (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Return the preferences
  RETURN QUERY
  SELECT * FROM public.adin_preferences
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
