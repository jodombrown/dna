UPDATE feature_flags 
SET is_enabled = true, 
    notes = 'Registration enabled for Alpha launch on Jan 6, 2026.',
    updated_at = now()
WHERE feature_key = 'REGISTRATION_ENABLED';