-- Add social media fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add event_reports table for reporting events
CREATE TABLE IF NOT EXISTS event_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on event_reports
ALTER TABLE event_reports ENABLE ROW LEVEL SECURITY;

-- Allow users to create reports
CREATE POLICY "Users can report events" ON event_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

-- Allow users to view their own reports
CREATE POLICY "Users can view their own reports" ON event_reports
  FOR SELECT
  USING (auth.uid() = reported_by);

-- Allow event creators to view reports on their events
CREATE POLICY "Event creators can view reports" ON event_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_reports.event_id
      AND e.created_by = auth.uid()
    )
  );