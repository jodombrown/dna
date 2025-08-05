-- Create function to check if user can create collaborations
CREATE OR REPLACE FUNCTION public.can_create_collaboration(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_profile_score INTEGER;
BEGIN
  -- Get user's profile completeness score
  SELECT profile_completeness_score INTO user_profile_score
  FROM public.profiles
  WHERE id = user_id_param;
  
  -- Return true if profile score is 80 or above
  RETURN COALESCE(user_profile_score, 0) >= 80;
END;
$$;

-- Create RLS policy for collaboration creation (if collaborations table exists)
-- This is a placeholder - adjust table name and structure as needed
-- Example for future collaboration table:
/*
CREATE POLICY "Users can create collaborations if profile complete"
ON public.collaborations
FOR INSERT
TO authenticated
WITH CHECK (public.can_create_collaboration(auth.uid()));
*/