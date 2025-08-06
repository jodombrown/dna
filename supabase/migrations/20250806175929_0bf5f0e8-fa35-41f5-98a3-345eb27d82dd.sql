-- Add feature flag for dashboard versioning
INSERT INTO feature_flags (feature_key, is_enabled, notes) 
VALUES ('enable_dashboard_v1', false, 'Toggle to enable preserved LinkedIn-style dashboard')
ON CONFLICT (feature_key) DO UPDATE SET
  notes = 'Toggle to enable preserved LinkedIn-style dashboard';

-- Add dashboard version tracking to user profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dashboard_version text DEFAULT 'v2';

-- Add comment for clarity
COMMENT ON COLUMN profiles.dashboard_version IS 'Tracks which dashboard version user should see (v1 = LinkedIn-style, v2 = new experience)';