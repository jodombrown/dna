-- Add beta tester columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS beta_phase TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS beta_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS beta_feedback_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS beta_features_tested TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS beta_signup_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS beta_status TEXT DEFAULT 'active' CHECK (beta_status IN ('active', 'expired', 'graduated', 'paused'));

-- Create beta feedback table to track all feedback during testing
CREATE TABLE IF NOT EXISTS public.beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('prompt_response', 'bug_report', 'suggestion', 'completion')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on beta_feedback
ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

-- Users can view their own beta feedback
CREATE POLICY "Users can view their own beta feedback" 
ON public.beta_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own beta feedback
CREATE POLICY "Users can create their own beta feedback" 
ON public.beta_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all beta feedback
CREATE POLICY "Admins can view all beta feedback" 
ON public.beta_feedback 
FOR SELECT 
USING (is_admin_user(auth.uid()));

-- Create function to automatically set beta expiration when marking as beta tester
CREATE OR REPLACE FUNCTION public.set_beta_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- If is_beta_tester is being set to true and beta_expires_at is null, set 10-day expiration
  IF NEW.is_beta_tester = true AND OLD.is_beta_tester = false AND NEW.beta_expires_at IS NULL THEN
    NEW.beta_expires_at = NOW() + INTERVAL '10 days';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-setting beta expiration
DROP TRIGGER IF EXISTS set_beta_expiration_trigger ON public.profiles;
CREATE TRIGGER set_beta_expiration_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_beta_expiration();

-- Update the handle_new_user function to handle beta signup data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_full_name TEXT;
  is_beta BOOLEAN DEFAULT false;
  beta_phase_val TEXT DEFAULT NULL;
BEGIN
  -- Extract full name from different OAuth providers
  IF NEW.raw_user_meta_data->>'name' IS NOT NULL THEN
    user_full_name := NEW.raw_user_meta_data->>'name';
  ELSIF NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
    user_full_name := NEW.raw_user_meta_data->>'full_name';
  ELSE
    user_full_name := NEW.email;
  END IF;

  -- Check if this is a beta signup
  IF NEW.raw_user_meta_data->>'is_beta_tester' = 'true' THEN
    is_beta := true;
    beta_phase_val := NEW.raw_user_meta_data->>'beta_phase';
  END IF;

  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    display_name,
    is_beta_tester,
    beta_phase,
    beta_expires_at,
    beta_signup_data,
    professional_role,
    current_country,
    company
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_full_name,
    is_beta,
    beta_phase_val,
    CASE WHEN is_beta THEN NOW() + INTERVAL '10 days' ELSE NULL END,
    CASE WHEN is_beta THEN NEW.raw_user_meta_data ELSE '{}' END,
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'company'
  );
  
  RETURN NEW;
END;
$$;