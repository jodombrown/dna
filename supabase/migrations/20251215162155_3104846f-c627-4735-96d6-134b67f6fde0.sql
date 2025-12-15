-- Add tour tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tour_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tour_skipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tour_current_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tour_last_shown_at TIMESTAMP WITH TIME ZONE;

-- Comment for clarity
COMMENT ON COLUMN public.profiles.tour_completed_at IS 'Timestamp when user completed the platform tour';
COMMENT ON COLUMN public.profiles.tour_skipped_at IS 'Timestamp when user skipped the tour (for banner display)';
COMMENT ON COLUMN public.profiles.tour_current_step IS 'Current step in the tour for resume functionality';
COMMENT ON COLUMN public.profiles.tour_last_shown_at IS 'Last time tour was shown to prevent repeated prompts';