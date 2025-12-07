UPDATE feature_flags 
SET is_enabled = true, updated_at = now() 
WHERE feature_key = 'REGISTRATION_ENABLED';