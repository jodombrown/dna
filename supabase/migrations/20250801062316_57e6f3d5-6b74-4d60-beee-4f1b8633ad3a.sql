-- Add new columns to profiles table for enhanced onboarding and ADIN tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS username_changes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_stage text DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS role text DEFAULT 'diaspora',
ADD COLUMN IF NOT EXISTS country_origin text,
ADD COLUMN IF NOT EXISTS current_location text,
ADD COLUMN IF NOT EXISTS skills text[],
ADD COLUMN IF NOT EXISTS sectors text[],
ADD COLUMN IF NOT EXISTS contribution_style text,
ADD COLUMN IF NOT EXISTS adin_prompt_status text DEFAULT 'none';

-- Add constraints and comments
COMMENT ON COLUMN public.profiles.username IS 'User-chosen handle, used in URLs. Editable only twice.';
COMMENT ON COLUMN public.profiles.username_changes IS 'Tracks how many times the username has been changed. Max 2.';
COMMENT ON COLUMN public.profiles.onboarding_stage IS 'Tracks progress through onboarding. Values: not_started, started, completed';
COMMENT ON COLUMN public.profiles.role IS 'User role. Default: diaspora. Future: admin, contributor, ally, etc.';
COMMENT ON COLUMN public.profiles.country_origin IS 'User''s country of origin (e.g. Nigeria, Ghana)';
COMMENT ON COLUMN public.profiles.current_location IS 'Current country/city of residence';
COMMENT ON COLUMN public.profiles.skills IS 'User-submitted tags for professional skills';
COMMENT ON COLUMN public.profiles.sectors IS 'User''s preferred sectors to contribute in';
COMMENT ON COLUMN public.profiles.contribution_style IS 'How they prefer to contribute (e.g. mentor, build, fund, share)';
COMMENT ON COLUMN public.profiles.adin_prompt_status IS 'ADIN status trigger state: none, eligible, prompted, declined, started, complete';

-- Add new column to adin_profiles table
ALTER TABLE public.adin_profiles 
ADD COLUMN IF NOT EXISTS prompted_by_event text;

COMMENT ON COLUMN public.adin_profiles.prompted_by_event IS 'Trigger event for prompt (e.g. projects_created, invites_sent, profile_views_threshold)';

-- Create profile_views table
CREATE TABLE IF NOT EXISTS public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS on profile_views
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profile_views
-- Allow anonymous and authenticated users to insert views
CREATE POLICY "Anyone can record profile views" 
ON public.profile_views 
FOR INSERT 
WITH CHECK (true);

-- No read access for regular users (only for analytics)
CREATE POLICY "Only admins can view profile analytics" 
ON public.profile_views 
FOR SELECT 
USING (is_admin_user(auth.uid()));

-- Create function to trigger ADIN prompt
CREATE OR REPLACE FUNCTION public.trigger_adin_prompt(target_user_id uuid, event_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update adin_prompt_status if user is eligible
  UPDATE public.profiles 
  SET adin_prompt_status = 'prompted'
  WHERE id = target_user_id 
    AND adin_prompt_status IN ('none', 'eligible');
  
  -- Update adin_profiles with the triggering event
  INSERT INTO public.adin_profiles (id, prompted_by_event)
  VALUES (target_user_id, event_type)
  ON CONFLICT (id) DO UPDATE SET
    prompted_by_event = event_type,
    last_updated = now();
END;
$$;

-- Add index for performance on profile_views
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON public.profile_views(viewed_at);

-- Add check constraint for username changes limit
ALTER TABLE public.profiles 
ADD CONSTRAINT check_username_changes_limit 
CHECK (username_changes <= 2);