-- Phase 2 Sprint 3: Post-onboarding feedback and engagement enhancements

-- Create onboarding feedback table
CREATE TABLE public.onboarding_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  emoji_feedback TEXT,
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for onboarding feedback
CREATE POLICY "Users can create their own feedback" ON public.onboarding_feedback
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own feedback" ON public.onboarding_feedback
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all feedback" ON public.onboarding_feedback
  FOR SELECT USING (is_admin_user((select auth.uid())));

-- Add community introduction fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS intro_text TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS intro_audio_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS intro_video_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completeness_score INTEGER DEFAULT 0;

-- Create function to calculate profile completeness
CREATE OR REPLACE FUNCTION public.calculate_profile_completeness(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  score INTEGER := 0;
  profile_data RECORD;
BEGIN
  SELECT * INTO profile_data FROM public.profiles WHERE id = target_user_id;
  
  IF profile_data IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Basic profile info (40 points total)
  IF profile_data.full_name IS NOT NULL AND profile_data.full_name != '' THEN
    score := score + 10;
  END IF;
  
  IF profile_data.bio IS NOT NULL AND profile_data.bio != '' THEN
    score := score + 10;
  END IF;
  
  IF profile_data.avatar_url IS NOT NULL AND profile_data.avatar_url != '' THEN
    score := score + 10;
  END IF;
  
  IF profile_data.location IS NOT NULL AND profile_data.location != '' THEN
    score := score + 10;
  END IF;
  
  -- Professional info (30 points total)
  IF profile_data.current_role IS NOT NULL AND profile_data.current_role != '' THEN
    score := score + 10;
  END IF;
  
  IF profile_data.skills IS NOT NULL AND array_length(profile_data.skills, 1) > 0 THEN
    score := score + 10;
  END IF;
  
  IF profile_data.years_experience IS NOT NULL THEN
    score := score + 10;
  END IF;
  
  -- Community engagement (30 points total)
  IF profile_data.intro_text IS NOT NULL AND profile_data.intro_text != '' THEN
    score := score + 10;
  END IF;
  
  IF profile_data.intro_audio_url IS NOT NULL OR profile_data.intro_video_url IS NOT NULL THEN
    score := score + 10;
  END IF;
  
  IF profile_data.interests IS NOT NULL AND array_length(profile_data.interests, 1) > 0 THEN
    score := score + 10;
  END IF;
  
  RETURN score;
END;
$$;

-- Trigger to update profile completeness score
CREATE OR REPLACE FUNCTION public.update_profile_completeness()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.profile_completeness_score := public.calculate_profile_completeness(NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger for profile completeness updates
DROP TRIGGER IF EXISTS trigger_update_profile_completeness ON public.profiles;
CREATE TRIGGER trigger_update_profile_completeness
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_completeness();