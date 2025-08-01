-- Update existing invites table structure if needed
ALTER TABLE public.invites 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS used_by_id UUID,
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;

-- Create profile views tracking table
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_id UUID NULL, -- NULL for anonymous views
  profile_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address INET NULL,
  user_agent TEXT NULL
);

-- Enable RLS on profile_views
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Profile views policies
CREATE POLICY "Users can view their own profile views" 
ON public.profile_views 
FOR SELECT 
USING (auth.uid() = profile_id OR is_admin_user(auth.uid()));

CREATE POLICY "Anyone can create profile views" 
ON public.profile_views 
FOR INSERT 
WITH CHECK (true);

-- Add referrer tracking to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referrer_id UUID,
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

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