-- Add user preferences and recommendations tables
CREATE TABLE IF NOT EXISTS public.user_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('community', 'event', 'project', 'user')),
  target_id uuid NOT NULL,
  target_title text,
  target_description text,
  match_score integer DEFAULT 0,
  match_reasons text[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'interested', 'joined', 'dismissed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add user onboarding preferences tracking
CREATE TABLE IF NOT EXISTS public.user_onboarding_selections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  selection_type text NOT NULL CHECK (selection_type IN ('community_join', 'event_interest', 'project_interest', 'user_connect')),
  target_id uuid NOT NULL,
  target_title text,
  selected_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Add first action tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_action_completed boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_action_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_recommendations_viewed boolean DEFAULT false;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON public.user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_type ON public.user_recommendations(recommendation_type, status);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_selections_user_id ON public.user_onboarding_selections(user_id);

-- Enable RLS
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding_selections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own recommendations" ON public.user_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" ON public.user_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations" ON public.user_recommendations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own selections" ON public.user_onboarding_selections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own selections" ON public.user_onboarding_selections
  FOR INSERT WITH CHECK (auth.uid() = user_id);