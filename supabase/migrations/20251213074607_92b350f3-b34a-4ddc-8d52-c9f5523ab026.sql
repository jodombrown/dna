-- Add REGISTRATION_ENABLED feature flag (set to false to lock signups during beta)
INSERT INTO feature_flags (feature_key, is_enabled, notes)
VALUES ('REGISTRATION_ENABLED', false, 'Controls public user registration. Set to false during beta to show waitlist instead of signup form.')
ON CONFLICT (feature_key) DO UPDATE SET is_enabled = false, notes = 'Controls public user registration. Set to false during beta to show waitlist instead of signup form.', updated_at = now();