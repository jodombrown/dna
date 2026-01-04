-- Disable registration for 72 hours - redirect new users to waitlist
UPDATE feature_flags 
SET is_enabled = false, 
    updated_at = now(),
    notes = 'Registration disabled for 72 hours starting Jan 4, 2026. Users redirected to waitlist.'
WHERE feature_key = 'REGISTRATION_ENABLED';