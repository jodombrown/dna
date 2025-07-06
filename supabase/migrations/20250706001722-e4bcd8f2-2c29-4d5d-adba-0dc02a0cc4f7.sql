-- Create waitlist signups table
CREATE TABLE public.waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  location text,
  role text NOT NULL CHECK (role IN ('individual', 'organization', 'community')),
  causes text[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create invites table  
CREATE TABLE public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL UNIQUE,
  role text CHECK (role IN ('individual', 'organization', 'community')),
  created_by uuid REFERENCES auth.users(id),
  used_at timestamp with time zone,
  expires_at timestamp with time zone DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- RLS policies for waitlist_signups
CREATE POLICY "Anyone can submit to waitlist"
  ON public.waitlist_signups
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all waitlist entries"
  ON public.waitlist_signups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (
        email = 'admin@diasporanetwork.africa' 
        OR email LIKE '%@diasporanetwork.africa'
      )
    )
  );

CREATE POLICY "Admins can update waitlist status"
  ON public.waitlist_signups
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (
        email = 'admin@diasporanetwork.africa' 
        OR email LIKE '%@diasporanetwork.africa'
      )
    )
  );

-- RLS policies for invites
CREATE POLICY "Admins can create invites"
  ON public.invites
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (
        email = 'admin@diasporanetwork.africa' 
        OR email LIKE '%@diasporanetwork.africa'
      )
    )
  );

CREATE POLICY "Anyone can view their own invite"
  ON public.invites
  FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all invites"
  ON public.invites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (
        email = 'admin@diasporanetwork.africa' 
        OR email LIKE '%@diasporanetwork.africa'
      )
    )
  );

CREATE POLICY "System can update invite usage"
  ON public.invites
  FOR UPDATE
  USING (true);