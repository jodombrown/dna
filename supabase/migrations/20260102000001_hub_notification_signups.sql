-- Hub Notification Signups for Dual-Mode Hub Architecture
-- Captures user interest for hubs in Aspiration Mode

-- 1. Create hub_notification_signups table
CREATE TABLE IF NOT EXISTS public.hub_notification_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub TEXT NOT NULL CHECK (hub IN ('convene', 'collaborate', 'contribute', 'convey')),
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  preferences JSONB DEFAULT '{}',
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(email, hub)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_hub_notification_signups_hub
  ON public.hub_notification_signups(hub);

CREATE INDEX IF NOT EXISTS idx_hub_notification_signups_user_id
  ON public.hub_notification_signups(user_id);

-- Enable RLS
ALTER TABLE public.hub_notification_signups ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can signup (insert)
CREATE POLICY "Anyone can signup for hub notifications"
  ON public.hub_notification_signups
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own signups
CREATE POLICY "Users can view own hub notification signups"
  ON public.hub_notification_signups
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Users can update their own signups
CREATE POLICY "Users can update own hub notification signups"
  ON public.hub_notification_signups
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Users can delete their own signups
CREATE POLICY "Users can delete own hub notification signups"
  ON public.hub_notification_signups
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 2. Create hub_host_applications table for host/creator applications
CREATE TABLE IF NOT EXISTS public.hub_host_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub TEXT NOT NULL CHECK (hub IN ('convene', 'collaborate', 'contribute', 'convey')),
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  organization TEXT,
  concept TEXT NOT NULL,
  audience_size TEXT,
  experience TEXT,
  additional_info JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hub_host_applications_hub
  ON public.hub_host_applications(hub);

CREATE INDEX IF NOT EXISTS idx_hub_host_applications_status
  ON public.hub_host_applications(status);

CREATE INDEX IF NOT EXISTS idx_hub_host_applications_user_id
  ON public.hub_host_applications(user_id);

-- Enable RLS
ALTER TABLE public.hub_host_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can submit applications
CREATE POLICY "Anyone can submit host applications"
  ON public.hub_host_applications
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own applications
CREATE POLICY "Users can view own host applications"
  ON public.hub_host_applications
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 3. Create function to get hub signup counts (for admin dashboard)
CREATE OR REPLACE FUNCTION public.get_hub_signup_counts()
RETURNS TABLE(hub TEXT, signup_count BIGINT, notified_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    hns.hub,
    COUNT(*)::BIGINT as signup_count,
    COUNT(hns.notified_at)::BIGINT as notified_count
  FROM hub_notification_signups hns
  GROUP BY hns.hub
  ORDER BY hns.hub;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_hub_signup_counts() TO authenticated;
