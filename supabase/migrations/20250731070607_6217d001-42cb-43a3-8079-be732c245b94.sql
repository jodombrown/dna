-- Create ADIN profiles table
CREATE TABLE IF NOT EXISTS public.adin_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  influence_score integer DEFAULT 0,
  verified boolean DEFAULT false,
  last_updated timestamp with time zone DEFAULT now(),
  region_focus text[], -- e.g., ['Kenya', 'Nigeria']
  sector_focus text[], -- e.g., ['Education', 'Health']
  tags jsonb DEFAULT '{}', -- optional AI-classified interests or behaviors
  created_at timestamp with time zone DEFAULT now()
);

-- Create user contributions table
CREATE TABLE IF NOT EXISTS public.user_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL, -- e.g., 'event_attendance', 'project_funding', 'mentorship'
  target_id uuid, -- project, event, etc.
  sector text,
  region text,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Update existing impact_log table structure if needed
ALTER TABLE public.impact_log 
ADD COLUMN IF NOT EXISTS action_type text,
ADD COLUMN IF NOT EXISTS context jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS score integer DEFAULT 1;

-- Update existing columns to match new schema
UPDATE public.impact_log SET action_type = type WHERE action_type IS NULL;
UPDATE public.impact_log SET context = metadata WHERE context IS NULL AND metadata IS NOT NULL;
UPDATE public.impact_log SET score = points WHERE score IS NULL AND points IS NOT NULL;

-- Create verified contributors table
CREATE TABLE IF NOT EXISTS public.verified_contributors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  verification_source text NOT NULL, -- 'admin', 'org', 'peer'
  notes text,
  verified_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone
);

-- Create ADIN signals table
CREATE TABLE IF NOT EXISTS public.adin_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  signal_type text NOT NULL, -- 'match_user', 'match_project', 'mentor_prompt'
  signal_data jsonb DEFAULT '{}', -- includes match score, sector, relevance context
  seen boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.adin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adin_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for adin_profiles
CREATE POLICY "Users can view and update their own ADIN profile"
ON public.adin_profiles FOR ALL
USING (id = auth.uid() OR public.is_user_admin(auth.uid()));

-- RLS Policies for user_contributions
CREATE POLICY "Users can view their own contributions, admins can view all"
ON public.user_contributions FOR SELECT
USING (user_id = auth.uid() OR public.is_user_admin(auth.uid()));

CREATE POLICY "Users can create their own contributions"
ON public.user_contributions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own contributions"
ON public.user_contributions FOR UPDATE
USING (user_id = auth.uid() OR public.is_user_admin(auth.uid()));

-- RLS Policies for verified_contributors
CREATE POLICY "Users can view their own verification status"
ON public.verified_contributors FOR SELECT
USING (user_id = auth.uid() OR public.is_user_admin(auth.uid()));

CREATE POLICY "Only admins can manage verified contributors"
ON public.verified_contributors FOR ALL
USING (public.is_user_admin(auth.uid()));

-- RLS Policies for adin_signals
CREATE POLICY "Users can view and update their own signals"
ON public.adin_signals FOR ALL
USING (user_id = auth.uid() OR public.is_user_admin(auth.uid()));

-- Create function to compute influence score
CREATE OR REPLACE FUNCTION public.compute_influence_score(target_user_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT SUM(score) FROM public.impact_log WHERE user_id = target_user_id) +
    (SELECT COUNT(*) * 5 FROM public.user_contributions WHERE user_id = target_user_id),
    0
  )::integer;
$$;

-- Create function to update influence scores (for scheduled execution)
CREATE OR REPLACE FUNCTION public.update_all_influence_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.adin_profiles 
  SET 
    influence_score = public.compute_influence_score(id),
    last_updated = now()
  WHERE EXISTS (SELECT 1 FROM public.profiles WHERE id = adin_profiles.id);
  
  -- Insert missing ADIN profiles for existing users
  INSERT INTO public.adin_profiles (id, influence_score)
  SELECT p.id, public.compute_influence_score(p.id)
  FROM public.profiles p
  WHERE NOT EXISTS (SELECT 1 FROM public.adin_profiles WHERE id = p.id)
  ON CONFLICT (id) DO NOTHING;
END;
$$;