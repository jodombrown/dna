-- Create referrals table for tracking referrals and community growth
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_email text NOT NULL,
  referral_code text NOT NULL UNIQUE,
  converted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create launch_config table for soft launch management
CREATE TABLE public.launch_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_mode text NOT NULL DEFAULT 'soft_launch' CHECK (launch_mode IN ('soft_launch', 'open_access')),
  launch_date timestamp with time zone,
  max_invites integer DEFAULT 1000,
  current_invites integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert initial launch configuration
INSERT INTO public.launch_config (launch_mode, max_invites, current_invites) 
VALUES ('soft_launch', 1000, 0);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their own referrals"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Authenticated users can create referrals"
  ON public.referrals
  FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "System can update referral conversions"
  ON public.referrals
  FOR UPDATE
  USING (true);

-- RLS policies for launch_config
CREATE POLICY "Anyone can view launch config"
  ON public.launch_config
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can update launch config"
  ON public.launch_config
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (email = 'admin@diasporanetwork.africa' OR email LIKE '%@diasporanetwork.africa')
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_email ON public.referrals(referred_email);

-- Add referrer_id to profiles for tracking referral source
ALTER TABLE public.profiles ADD COLUMN referrer_id uuid REFERENCES public.profiles(id);

-- Update trigger for referrals timestamp management
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate a 8-character alphanumeric code
    new_code := upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;