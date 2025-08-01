-- Create invites table for user referral system
CREATE TABLE public.invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  email TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired', 'revoked')),
  used_by_id UUID NULL,
  used_at TIMESTAMP WITH TIME ZONE NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create profile views tracking table
CREATE TABLE public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_id UUID NULL, -- NULL for anonymous views
  profile_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address INET NULL,
  user_agent TEXT NULL
);

-- Enable RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Invites policies
CREATE POLICY "Users can view their own invites and received invites" 
ON public.invites 
FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = used_by_id);

CREATE POLICY "Users can create their own invites" 
ON public.invites 
FOR INSERT 
WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update their own invites" 
ON public.invites 
FOR UPDATE 
USING (auth.uid() = referrer_id);

CREATE POLICY "Admins can view all invites" 
ON public.invites 
FOR ALL 
USING (is_admin_user(auth.uid()));

-- Profile views policies
CREATE POLICY "Users can view their own profile views" 
ON public.profile_views 
FOR SELECT 
USING (auth.uid() = profile_id OR is_admin_user(auth.uid()));

CREATE POLICY "Anyone can create profile views" 
ON public.profile_views 
FOR INSERT 
WITH CHECK (true);

-- Add referrer tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN referrer_id UUID NULL,
ADD COLUMN referral_code TEXT NULL UNIQUE;

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    new_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.invites WHERE referral_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to handle referral signup
CREATE OR REPLACE FUNCTION public.handle_referral_signup(new_user_id UUID, referral_code_param TEXT)
RETURNS VOID AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Find the invite by referral code
  SELECT * INTO invite_record 
  FROM public.invites 
  WHERE referral_code = referral_code_param 
    AND status = 'pending' 
    AND expires_at > NOW();
  
  IF invite_record IS NOT NULL THEN
    -- Update the invite as used
    UPDATE public.invites 
    SET 
      status = 'used',
      used_by_id = new_user_id,
      used_at = NOW(),
      updated_at = NOW()
    WHERE id = invite_record.id;
    
    -- Update the new user's profile with referrer info
    UPDATE public.profiles 
    SET referrer_id = invite_record.referrer_id
    WHERE id = new_user_id;
    
    -- Award points to referrer
    INSERT INTO public.impact_log (user_id, type, target_type, target_id, pillar, points)
    VALUES (invite_record.referrer_id, 'referral', 'user', new_user_id, 'connect', 10);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamps trigger
CREATE TRIGGER update_invites_updated_at
  BEFORE UPDATE ON public.invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();