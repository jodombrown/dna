-- Add username system to profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS username VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS username_change_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS username_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create case-insensitive unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower 
  ON profiles(LOWER(username));

-- Update last_seen_at on profile updates (for activity tracking)
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update last_seen_at
DROP TRIGGER IF EXISTS trigger_update_last_seen ON profiles;
CREATE TRIGGER trigger_update_last_seen
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_seen();

-- Function to check username availability (case-insensitive)
CREATE OR REPLACE FUNCTION check_username_available(p_username TEXT, p_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE LOWER(username) = LOWER(p_username)
    AND (p_user_id IS NULL OR id != p_user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;