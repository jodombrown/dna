-- Create waitlist table for beta signups
CREATE TABLE IF NOT EXISTS public.beta_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beta_waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert their waitlist request
CREATE POLICY "Anyone can join waitlist"
ON public.beta_waitlist
FOR INSERT
WITH CHECK (true);

-- Policy: Users can view their own waitlist entry
CREATE POLICY "Users can view own waitlist entry"
ON public.beta_waitlist
FOR SELECT
USING (email = auth.email());

-- Set registration flag to disabled
INSERT INTO public.feature_flags (feature_key, is_enabled, notes)
VALUES ('REGISTRATION_ENABLED', false, 'Private beta - Opens November 1, 2025')
ON CONFLICT (feature_key) 
DO UPDATE SET 
  is_enabled = false,
  notes = 'Private beta - Opens November 1, 2025',
  updated_at = now();