-- Enable public registration for all users
UPDATE feature_flags 
SET is_enabled = true 
WHERE feature_key = 'REGISTRATION_ENABLED';