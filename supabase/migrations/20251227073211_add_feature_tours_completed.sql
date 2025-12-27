-- Add feature_tours_completed JSONB column to profiles table
-- This supports the scalable feature tour system that can track tour completion
-- for multiple features (feedback-hub, connect, convene, contribute, etc.)

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS feature_tours_completed JSONB DEFAULT '{}'::jsonb;

-- Comment for clarity
COMMENT ON COLUMN public.profiles.feature_tours_completed IS 'JSONB object tracking feature tour completion state per feature (e.g., {"feedback-hub": {"completedAt": "...", "currentStep": 0}})';

-- Create an index for efficient querying (optional, useful if we query by specific feature)
CREATE INDEX IF NOT EXISTS idx_profiles_feature_tours ON public.profiles USING gin (feature_tours_completed);
