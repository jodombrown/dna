-- Create African Diaspora Intelligence Network (ADIN) backend foundation

-- User ADIN profile table for tracking interests, skills, and engagement patterns
CREATE TABLE IF NOT EXISTS public.user_adin_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interests TEXT[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  engagement_pillars TEXT[] DEFAULT '{}', -- connect, collaborate, contribute
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Connection signals table for intelligent matchmaking and recommendations
CREATE TABLE IF NOT EXISTS public.adin_connection_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL, -- 'shared_interests', 'skill_match', 'geographic_proximity', etc.
  score FLOAT8 NOT NULL DEFAULT 0.0, -- 0.0 to 1.0 compatibility score
  context JSONB DEFAULT '{}', -- additional metadata about the connection signal
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.user_adin_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adin_connection_signals ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_adin_profile
CREATE POLICY "Users can view their own ADIN profile" 
  ON public.user_adin_profile 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ADIN profile" 
  ON public.user_adin_profile 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ADIN profile" 
  ON public.user_adin_profile 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can read ADIN profiles for matching" 
  ON public.user_adin_profile 
  FOR SELECT 
  USING (true);

-- RLS policies for adin_connection_signals
CREATE POLICY "Users can view connection signals involving them" 
  ON public.adin_connection_signals 
  FOR SELECT 
  USING (auth.uid() = source_user OR auth.uid() = target_user);

CREATE POLICY "System can create connection signals" 
  ON public.adin_connection_signals 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view all connection signals" 
  ON public.adin_connection_signals 
  FOR SELECT 
  USING (public.is_admin_user(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_adin_profile_user_id ON public.user_adin_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_user_adin_profile_last_active ON public.user_adin_profile(last_active);
CREATE INDEX IF NOT EXISTS idx_user_adin_profile_engagement_pillars ON public.user_adin_profile USING GIN(engagement_pillars);
CREATE INDEX IF NOT EXISTS idx_user_adin_profile_interests ON public.user_adin_profile USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_user_adin_profile_skills ON public.user_adin_profile USING GIN(skills);

CREATE INDEX IF NOT EXISTS idx_adin_connection_signals_source_user ON public.adin_connection_signals(source_user);
CREATE INDEX IF NOT EXISTS idx_adin_connection_signals_target_user ON public.adin_connection_signals(target_user);
CREATE INDEX IF NOT EXISTS idx_adin_connection_signals_score ON public.adin_connection_signals(score DESC);
CREATE INDEX IF NOT EXISTS idx_adin_connection_signals_timestamp ON public.adin_connection_signals(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_adin_connection_signals_reason ON public.adin_connection_signals(reason);

-- Create trigger for updating user_adin_profile timestamps
CREATE TRIGGER update_user_adin_profile_updated_at
  BEFORE UPDATE ON public.user_adin_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update last_active timestamp when user performs actions
CREATE OR REPLACE FUNCTION public.update_adin_last_active(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_adin_profile (user_id, last_active)
  VALUES (target_user_id, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    last_active = now(),
    updated_at = now();
END;
$$;