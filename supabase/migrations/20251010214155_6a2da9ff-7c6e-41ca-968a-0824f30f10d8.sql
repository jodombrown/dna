-- Add registration_enabled feature flag
-- This allows you to easily toggle public registration on/off without code changes

INSERT INTO feature_flags (feature_key, is_enabled, notes)
VALUES (
  'REGISTRATION_ENABLED',
  false, -- Set to false to lock registration (admin only during beta)
  'Controls whether public registration is enabled. Toggle to true when ready to open to all users.'
)
ON CONFLICT (feature_key) DO UPDATE
SET notes = EXCLUDED.notes;