-- Add missing columns to user_engagement_tracking table
ALTER TABLE public.user_engagement_tracking
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_profile_update TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_connection_made TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_post_created TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reminder_stage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_engagement_last_active ON public.user_engagement_tracking(last_active DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_score ON public.user_engagement_tracking(engagement_score DESC);

-- Create or replace trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_engagement_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_engagement_tracking_timestamp ON public.user_engagement_tracking;
CREATE TRIGGER update_engagement_tracking_timestamp
  BEFORE UPDATE ON public.user_engagement_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_engagement_tracking_updated_at();
