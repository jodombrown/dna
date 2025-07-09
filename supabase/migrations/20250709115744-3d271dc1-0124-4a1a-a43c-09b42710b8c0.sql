-- Create contributor verification requests table
CREATE TABLE public.adin_contributor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  evidence_links TEXT[], -- Array of URLs for documentation/proof
  impact_type TEXT NOT NULL CHECK (impact_type IN ('startup', 'policy', 'research', 'education', 'infrastructure', 'community', 'other')),
  country_focus TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_info')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.adin_contributor_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for contributor requests
CREATE POLICY "Users can view their own requests" 
ON public.adin_contributor_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests" 
ON public.adin_contributor_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending requests" 
ON public.adin_contributor_requests 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all requests" 
ON public.adin_contributor_requests 
FOR SELECT 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can update all requests" 
ON public.adin_contributor_requests 
FOR UPDATE 
USING (is_admin_user(auth.uid()));

-- Add verification status to ADIN profile
ALTER TABLE public.user_adin_profile 
ADD COLUMN is_verified_contributor BOOLEAN DEFAULT false,
ADD COLUMN contributor_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN contributor_impact_type TEXT,
ADD COLUMN contributor_score NUMERIC DEFAULT 0;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_contributor_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contributor_requests_updated_at
BEFORE UPDATE ON public.adin_contributor_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_contributor_requests_updated_at();

-- Create function to automatically update ADIN profile when request is approved
CREATE OR REPLACE FUNCTION public.handle_contributor_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- When a request is approved, update the user's ADIN profile
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE public.user_adin_profile 
    SET 
      is_verified_contributor = true,
      contributor_verified_at = now(),
      contributor_impact_type = NEW.impact_type,
      contributor_score = CASE 
        WHEN NEW.impact_type IN ('startup', 'policy', 'research') THEN 10
        WHEN NEW.impact_type IN ('education', 'infrastructure') THEN 8
        ELSE 6
      END,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  -- If rejected, ensure verification is removed
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    UPDATE public.user_adin_profile 
    SET 
      is_verified_contributor = false,
      contributor_verified_at = NULL,
      contributor_impact_type = NULL,
      contributor_score = 0,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for contributor approval
CREATE TRIGGER handle_contributor_approval_trigger
AFTER UPDATE ON public.adin_contributor_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_contributor_approval();

-- Create indexes for better performance
CREATE INDEX idx_contributor_requests_user_id ON public.adin_contributor_requests(user_id);
CREATE INDEX idx_contributor_requests_status ON public.adin_contributor_requests(status);
CREATE INDEX idx_contributor_requests_created_at ON public.adin_contributor_requests(created_at DESC);
CREATE INDEX idx_adin_profile_verified_contributor ON public.user_adin_profile(is_verified_contributor);

-- Create function to get user verification status
CREATE OR REPLACE FUNCTION public.get_user_verification_status(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'is_verified', COALESCE(is_verified_contributor, false),
    'verified_at', contributor_verified_at,
    'impact_type', contributor_impact_type,
    'score', COALESCE(contributor_score, 0)
  ) INTO result
  FROM public.user_adin_profile 
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(result, '{"is_verified": false, "score": 0}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;