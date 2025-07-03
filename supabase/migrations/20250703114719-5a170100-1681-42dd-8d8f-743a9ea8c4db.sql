
-- Update get_newsletter_followers function with SET search_path
CREATE OR REPLACE FUNCTION public.get_newsletter_followers(newsletter_user_id uuid)
RETURNS TABLE(user_id uuid, email text, full_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id as user_id,
    p.email,
    p.full_name
  FROM public.profiles p
  WHERE p.newsletter_emails = true
    AND p.email IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.follows f 
      WHERE f.target_type = 'user' 
      AND f.target_id = newsletter_user_id::text 
      AND f.follower_id = p.id
    );
$$;
