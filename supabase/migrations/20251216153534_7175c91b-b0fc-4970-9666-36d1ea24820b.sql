-- Create function to check profile completion and auto-verify
CREATE OR REPLACE FUNCTION public.check_and_update_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  completion_score INT := 0;
  current_verification verification_status;
BEGIN
  -- Get current verification status
  current_verification := NEW.verification_status;
  
  -- If already fully_verified by admin, don't downgrade
  IF current_verification = 'fully_verified' THEN
    RETURN NEW;
  END IF;
  
  -- Calculate profile completion score (matching profileCompletion.ts logic)
  -- Pillar 1: Identity (25 pts)
  IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url != '' THEN
    completion_score := completion_score + 10;
  END IF;
  IF NEW.full_name IS NOT NULL AND LENGTH(NEW.full_name) >= 2 THEN
    completion_score := completion_score + 5;
  END IF;
  IF NEW.headline IS NOT NULL AND LENGTH(NEW.headline) >= 5 THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Pillar 2: Professional (20 pts)
  IF NEW.profession IS NOT NULL AND NEW.profession != '' THEN
    completion_score := completion_score + 5;
  END IF;
  IF NEW.bio IS NOT NULL AND LENGTH(NEW.bio) >= 50 THEN
    completion_score := completion_score + 10;
  END IF;
  IF NEW.linkedin_url IS NOT NULL AND NEW.linkedin_url != '' THEN
    completion_score := completion_score + 5;
  END IF;
  
  -- Pillar 3: Discovery (30 pts)
  IF NEW.skills IS NOT NULL AND array_length(NEW.skills, 1) >= 3 THEN
    completion_score := completion_score + 10;
  END IF;
  IF NEW.focus_areas IS NOT NULL AND array_length(NEW.focus_areas, 1) >= 2 THEN
    completion_score := completion_score + 10;
  END IF;
  IF NEW.interests IS NOT NULL AND array_length(NEW.interests, 1) >= 3 THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Pillar 4: Diaspora Context (15 pts)
  IF NEW.country_of_origin IS NOT NULL AND NEW.country_of_origin != '' THEN
    completion_score := completion_score + 5;
  END IF;
  IF NEW.current_country IS NOT NULL AND NEW.current_country != '' THEN
    completion_score := completion_score + 5;
  END IF;
  IF NEW.languages IS NOT NULL AND array_length(NEW.languages, 1) >= 1 THEN
    completion_score := completion_score + 5;
  END IF;
  
  -- Pillar 5: Engagement (10 pts)
  IF NEW.banner_url IS NOT NULL AND NEW.banner_url != '' THEN
    completion_score := completion_score + 5;
  END IF;
  IF NEW.industries IS NOT NULL AND array_length(NEW.industries, 1) >= 1 THEN
    completion_score := completion_score + 5;
  END IF;
  
  -- Auto-verify if score reaches 100
  IF completion_score >= 100 AND current_verification = 'pending_verification' THEN
    NEW.verification_status := 'soft_verified';
    NEW.verification_updated_at := NOW();
    NEW.verification_method := 'auto_profile_completion';
    NEW.verified := TRUE;
    NEW.verified_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-verification on profile updates
DROP TRIGGER IF EXISTS trigger_check_verification ON public.profiles;
CREATE TRIGGER trigger_check_verification
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_update_verification();

-- Also run on insert for new profiles that might be complete
DROP TRIGGER IF EXISTS trigger_check_verification_insert ON public.profiles;
CREATE TRIGGER trigger_check_verification_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_update_verification();

-- Create admin function to fully verify a user (permanent)
CREATE OR REPLACE FUNCTION public.admin_verify_user(target_user_id UUID, admin_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if admin has permission (you can add role check here later)
  UPDATE public.profiles
  SET 
    verification_status = 'fully_verified',
    verification_updated_at = NOW(),
    verification_method = 'admin_verified',
    verified = TRUE,
    verified_at = NOW()
  WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$$;