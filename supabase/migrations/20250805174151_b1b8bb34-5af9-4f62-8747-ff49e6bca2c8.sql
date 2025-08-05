-- Create function to check if user profile meets visibility requirements
CREATE OR REPLACE FUNCTION public.profile_meets_visibility_requirement(user_id_param uuid, min_score integer DEFAULT 50)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_profile_score INTEGER;
  user_is_public BOOLEAN;
BEGIN
  -- Get user's profile completeness score and public status
  SELECT profile_completeness_score, is_public 
  INTO user_profile_score, user_is_public
  FROM public.profiles
  WHERE id = user_id_param;
  
  -- Return true if profile is public and meets minimum score
  RETURN COALESCE(user_is_public, false) = true 
    AND COALESCE(user_profile_score, 0) >= min_score;
END;
$$;

-- Create function to check if user can send messages
CREATE OR REPLACE FUNCTION public.can_send_messages(user_id_param uuid)
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

-- Update public profiles policy to include completeness check
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON public.profiles;
CREATE POLICY "Profiles are publicly viewable with completeness check"
ON public.profiles
FOR SELECT
USING (public.profile_meets_visibility_requirement(id, 50));

-- Add messaging policies (if messages table exists)
-- For conversations table
CREATE POLICY "Users can create conversations if profile complete"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  public.can_send_messages(auth.uid()) 
  AND (auth.uid() = user_1_id OR auth.uid() = user_2_id)
);

-- For messages table (if it exists) - create placeholder policy
-- This will need to be adjusted based on actual messages table structure
/*
CREATE POLICY "Users can send messages if profile complete"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  public.can_send_messages(auth.uid()) 
  AND sender_id = auth.uid()
);
*/