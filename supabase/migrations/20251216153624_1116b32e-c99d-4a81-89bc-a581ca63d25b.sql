-- Trigger verification check for all existing profiles by touching updated_at
-- This will run the trigger and auto-verify any profiles at 100%
UPDATE profiles 
SET updated_at = NOW() 
WHERE verification_status = 'pending_verification';