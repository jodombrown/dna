-- Migration 1: Add CONNECT-specific fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS intentions TEXT[],
ADD COLUMN IF NOT EXISTS africa_focus_areas TEXT[],
ADD COLUMN IF NOT EXISTS diaspora_status TEXT,
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_intentions ON public.profiles USING GIN(intentions);
CREATE INDEX IF NOT EXISTS idx_profiles_africa_focus ON public.profiles USING GIN(africa_focus_areas);
CREATE INDEX IF NOT EXISTS idx_profiles_diaspora_status ON public.profiles(diaspora_status);
CREATE INDEX IF NOT EXISTS idx_profiles_completion ON public.profiles(profile_completion_percentage);

-- Migration 2: Add connection_note to connections table
ALTER TABLE public.connections
ADD COLUMN IF NOT EXISTS connection_note TEXT;

-- Migration 3: Create events_log table for system event tracking
CREATE TABLE IF NOT EXISTS public.events_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on events_log
ALTER TABLE public.events_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own events, admins can view all
CREATE POLICY "Users can view own events" ON public.events_log
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Policy: System can insert events
CREATE POLICY "System can insert events" ON public.events_log
  FOR INSERT WITH CHECK (true);

-- Create indexes for events_log
CREATE INDEX IF NOT EXISTS idx_events_log_user ON public.events_log(user_id);
CREATE INDEX IF NOT EXISTS idx_events_log_type ON public.events_log(event_type);
CREATE INDEX IF NOT EXISTS idx_events_log_created ON public.events_log(created_at DESC);

-- Migration 4: Create profile completion calculation function with PRD weights
CREATE OR REPLACE FUNCTION public.calculate_profile_completion_percentage(profile_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  score INTEGER := 0;
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM public.profiles WHERE id = profile_id;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Required for 40% minimum (unlock other modules)
  IF profile_record.full_name IS NOT NULL AND LENGTH(profile_record.full_name) > 0 THEN
    score := score + 10;
  END IF;
  
  IF profile_record.location IS NOT NULL AND LENGTH(profile_record.location) > 0 THEN
    score := score + 10;
  END IF;
  
  IF profile_record.country_of_origin IS NOT NULL AND LENGTH(profile_record.country_of_origin) > 0 THEN
    score := score + 10;
  END IF;
  
  IF profile_record.intentions IS NOT NULL AND array_length(profile_record.intentions, 1) >= 1 THEN
    score := score + 10;
  END IF;
  
  -- For higher completion
  IF profile_record.headline IS NOT NULL AND LENGTH(profile_record.headline) > 0 THEN
    score := score + 5;
  END IF;
  
  IF profile_record.profession IS NOT NULL AND LENGTH(profile_record.profession) > 0 THEN
    score := score + 5;
  END IF;
  
  IF profile_record.company IS NOT NULL AND LENGTH(profile_record.company) > 0 THEN
    score := score + 5;
  END IF;
  
  IF profile_record.bio IS NOT NULL AND LENGTH(profile_record.bio) > 50 THEN
    score := score + 10;
  END IF;
  
  IF profile_record.africa_focus_areas IS NOT NULL AND array_length(profile_record.africa_focus_areas, 1) >= 1 THEN
    score := score + 10;
  END IF;
  
  IF profile_record.diaspora_status IS NOT NULL AND LENGTH(profile_record.diaspora_status) > 0 THEN
    score := score + 10;
  END IF;
  
  IF profile_record.skills IS NOT NULL AND array_length(profile_record.skills, 1) >= 3 THEN
    score := score + 10;
  END IF;
  
  IF profile_record.avatar_url IS NOT NULL AND LENGTH(profile_record.avatar_url) > 0 THEN
    score := score + 10;
  END IF;
  
  RETURN score;
END;
$$;

-- Create trigger to auto-update profile_completion_percentage
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_completion INTEGER;
  new_completion INTEGER;
BEGIN
  old_completion := COALESCE(OLD.profile_completion_percentage, 0);
  new_completion := public.calculate_profile_completion_percentage(NEW.id);
  
  NEW.profile_completion_percentage := new_completion;
  
  -- Emit profile_completed event when crossing 40% threshold
  IF old_completion < 40 AND new_completion >= 40 THEN
    INSERT INTO public.events_log (event_type, user_id, payload)
    VALUES (
      'profile_completed',
      NEW.id,
      jsonb_build_object(
        'completion_percentage', new_completion,
        'africa_focus_areas', COALESCE(NEW.africa_focus_areas, ARRAY[]::TEXT[]),
        'intentions', COALESCE(NEW.intentions, ARRAY[]::TEXT[])
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON public.profiles;

-- Create trigger on profiles table
CREATE TRIGGER trigger_update_profile_completion
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_completion();

-- Helper function to emit connection_made event
CREATE OR REPLACE FUNCTION public.emit_connection_made_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only emit when status changes to 'accepted'
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
    INSERT INTO public.events_log (event_type, user_id, payload)
    VALUES (
      'connection_made',
      NEW.a,
      jsonb_build_object(
        'connected_user_id', NEW.b,
        'connection_note', NEW.connection_note
      )
    );
    
    -- Also emit for user B
    INSERT INTO public.events_log (event_type, user_id, payload)
    VALUES (
      'connection_made',
      NEW.b,
      jsonb_build_object(
        'connected_user_id', NEW.a,
        'connection_note', NEW.connection_note
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on connections table
DROP TRIGGER IF EXISTS trigger_connection_made ON public.connections;
CREATE TRIGGER trigger_connection_made
  AFTER INSERT OR UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.emit_connection_made_event();