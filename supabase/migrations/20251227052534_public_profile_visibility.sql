-- Migration: Public Profile Visibility Settings
-- Description: Add per-field visibility controls for public profiles
-- PRD: Public Profile Optimization

-- Add public_visibility column with sensible defaults per PRD Section 3.3
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_visibility JSONB DEFAULT '{
  "avatar": true,
  "headline": true,
  "bio": true,
  "location": true,
  "heritage": true,
  "industry": true,
  "company": true,
  "email": false,
  "phone": false,
  "linkedin_url": true,
  "website_url": true,
  "connection_count": true,
  "event_count": true,
  "member_since": true
}'::jsonb;

-- Add profile view tracking columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_profile_views INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_public_view_at TIMESTAMPTZ;

-- Create index for username lookups (should already exist, but ensure it does)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Create profile_views table for detailed analytics (optional per PRD Section 4.2)
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  is_public_view BOOLEAN DEFAULT true
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views(viewed_at);

-- Enable RLS on profile_views
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profile view stats
DROP POLICY IF EXISTS "Users can view own profile views" ON profile_views;
CREATE POLICY "Users can view own profile views"
  ON profile_views FOR SELECT
  USING (profile_id = auth.uid());

-- RLS Policy: Anyone can insert a view record (for anonymous views)
DROP POLICY IF EXISTS "Anyone can track profile views" ON profile_views;
CREATE POLICY "Anyone can track profile views"
  ON profile_views FOR INSERT
  WITH CHECK (true);

-- Function to track a profile view and update the counter
CREATE OR REPLACE FUNCTION track_profile_view(
  p_profile_id UUID,
  p_viewer_id UUID DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the view record
  INSERT INTO profile_views (profile_id, viewer_id, referrer, user_agent, is_public_view)
  VALUES (p_profile_id, p_viewer_id, p_referrer, p_user_agent, p_viewer_id IS NULL OR p_viewer_id != p_profile_id);

  -- Update the profile view counter
  UPDATE profiles
  SET
    public_profile_views = COALESCE(public_profile_views, 0) + 1,
    last_public_view_at = NOW()
  WHERE id = p_profile_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION track_profile_view TO authenticated, anon;

-- Comment on the new columns
COMMENT ON COLUMN profiles.public_visibility IS 'Per-field visibility settings for public profile (JSON object with field names as keys and boolean values)';
COMMENT ON COLUMN profiles.public_profile_views IS 'Total count of public profile views';
COMMENT ON COLUMN profiles.last_public_view_at IS 'Timestamp of the last public profile view';
COMMENT ON TABLE profile_views IS 'Detailed tracking of profile views for analytics';
