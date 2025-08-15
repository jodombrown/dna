-- Create skill_analytics table to track skill usage and trends
CREATE TABLE IF NOT EXISTS public.skill_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('added', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  profile_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skill_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for skill analytics
CREATE POLICY "Users can view their own skill analytics"
ON public.skill_analytics
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert skill analytics"
ON public.skill_analytics
FOR INSERT
WITH CHECK (true);

-- Create index for better performance on skill queries
CREATE INDEX IF NOT EXISTS idx_skill_analytics_skill_name ON public.skill_analytics(skill_name);
CREATE INDEX IF NOT EXISTS idx_skill_analytics_user_id ON public.skill_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_analytics_created_at ON public.skill_analytics(created_at);

-- Create skill_connections table for tracking skill-based connections
CREATE TABLE IF NOT EXISTS public.skill_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_skills TEXT[] NOT NULL,
  connection_strength INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_a_id, user_b_id)
);

-- Enable RLS
ALTER TABLE public.skill_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for skill connections
CREATE POLICY "Users can view their own skill connections"
ON public.skill_connections
FOR SELECT
USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Create function to track skill changes
CREATE OR REPLACE FUNCTION public.track_skill_changes()
RETURNS TRIGGER AS $$
DECLARE
    old_skills TEXT[];
    new_skills TEXT[];
    added_skills TEXT[];
    removed_skills TEXT[];
    skill TEXT;
BEGIN
    -- Get old and new skills
    old_skills := COALESCE(OLD.skills, ARRAY[]::TEXT[]);
    new_skills := COALESCE(NEW.skills, ARRAY[]::TEXT[]);
    
    -- Find added skills
    SELECT ARRAY(
        SELECT unnest(new_skills)
        EXCEPT
        SELECT unnest(old_skills)
    ) INTO added_skills;
    
    -- Find removed skills
    SELECT ARRAY(
        SELECT unnest(old_skills)
        EXCEPT
        SELECT unnest(new_skills)
    ) INTO removed_skills;
    
    -- Track added skills
    FOREACH skill IN ARRAY added_skills
    LOOP
        INSERT INTO public.skill_analytics (skill_name, user_id, action_type, profile_updated_at)
        VALUES (skill, NEW.id, 'added', now());
    END LOOP;
    
    -- Track removed skills
    FOREACH skill IN ARRAY removed_skills
    LOOP
        INSERT INTO public.skill_analytics (skill_name, user_id, action_type, profile_updated_at)
        VALUES (skill, NEW.id, 'removed', now());
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically track skill changes
DROP TRIGGER IF EXISTS trigger_track_skill_changes ON public.profiles;
CREATE TRIGGER trigger_track_skill_changes
    AFTER UPDATE OF skills ON public.profiles
    FOR EACH ROW
    WHEN (OLD.skills IS DISTINCT FROM NEW.skills)
    EXECUTE FUNCTION public.track_skill_changes();