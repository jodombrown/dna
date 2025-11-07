-- Enable admin access to beta_waitlist table

-- Policy: Admins can view all waitlist entries
CREATE POLICY "Admins can view all waitlist entries"
ON beta_waitlist FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Policy: Admins can update waitlist entries (approve/reject)
CREATE POLICY "Admins can update waitlist entries"
ON beta_waitlist FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Policy: Admins can delete waitlist entries if needed
CREATE POLICY "Admins can delete waitlist entries"
ON beta_waitlist FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Add admin activity logging table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin_activity_log
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view activity logs
CREATE POLICY "Admins can view activity logs"
ON admin_activity_log FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Policy: System can insert activity logs
CREATE POLICY "System can insert activity logs"
ON admin_activity_log FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = admin_id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_status ON beta_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_created_at ON beta_waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);