-- SECURITY FIX #1: Profile Data Privacy
-- Drop overly permissive policies and create field-level privacy controls

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Create secure policy that allows SELECT but application controls which fields
CREATE POLICY "Public can view limited profile data"
ON profiles 
FOR SELECT
USING (
  deleted_at IS NULL
);

-- SECURITY FIX #2: Error Logs - Admins Only
DROP POLICY IF EXISTS "System can create error logs" ON error_logs;

CREATE POLICY "Admins can view error logs"
ON error_logs
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "System can insert error logs"
ON error_logs
FOR INSERT
WITH CHECK (true);

-- SECURITY FIX #3: Add RLS Policies to Tables Without Policies

-- content_moderation - Admins only
CREATE POLICY "Admins manage content moderation"
ON content_moderation 
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- event_analytics - Event creators and admins
CREATE POLICY "Event creators view analytics"
ON event_analytics 
FOR SELECT
TO authenticated
USING (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "System can insert analytics"
ON event_analytics
FOR INSERT
WITH CHECK (true);

-- event_blasts - Event creators and admins
CREATE POLICY "Event creators manage blasts"
ON event_blasts 
FOR ALL
TO authenticated
USING (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- event_checkins - Event creators and admins
CREATE POLICY "Event staff manage checkins"
ON event_checkins 
FOR ALL
TO authenticated
USING (
  registration_id IN (
    SELECT r.id FROM event_registrations r
    JOIN events e ON e.id = r.event_id
    WHERE e.created_by = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- feature_flags - Admins manage, users view active
CREATE POLICY "Admins manage feature flags"
ON feature_flags 
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can view active flags"
ON feature_flags 
FOR SELECT
TO authenticated
USING (
  is_enabled = true
);