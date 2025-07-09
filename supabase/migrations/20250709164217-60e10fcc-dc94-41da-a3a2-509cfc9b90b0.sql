-- Fix security warnings by setting immutable search paths for functions

-- Update update_contributor_requests_updated_at function with SET search_path
CREATE OR REPLACE FUNCTION public.update_contributor_requests_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update handle_contributor_approval function with SET search_path
CREATE OR REPLACE FUNCTION public.handle_contributor_approval()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
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
$function$;

-- Update get_user_verification_status function with SET search_path
CREATE OR REPLACE FUNCTION public.get_user_verification_status(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;