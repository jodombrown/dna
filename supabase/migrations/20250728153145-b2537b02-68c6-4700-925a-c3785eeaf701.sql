-- Update the reset_seeded_data function to check for admin privileges
CREATE OR REPLACE FUNCTION public.reset_seeded_data()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required to reset seeded data.';
  END IF;
  
  -- Delete in order of foreign key dependency (child to parent)
  -- Comments reference posts
  DELETE FROM public.comments WHERE is_seeded = true;
  
  -- Post likes reference posts
  DELETE FROM public.post_likes WHERE is_seeded = true;
  
  -- Contact requests reference profiles
  DELETE FROM public.contact_requests WHERE is_seeded = true;
  
  -- Posts reference profiles (author_id)
  DELETE FROM public.posts WHERE is_seeded = true;
  
  -- Events reference profiles (created_by)
  DELETE FROM public.events WHERE is_seeded = true;
  
  -- Profiles are the parent table
  DELETE FROM public.profiles WHERE is_seeded = true;
  
  -- Log the reset action
  RAISE NOTICE 'All seeded data has been reset successfully by admin user: %', auth.uid();
END;
$$;

-- Revoke from public and grant to authenticated users (admin check is inside function)
REVOKE ALL ON FUNCTION public.reset_seeded_data() FROM public;
GRANT EXECUTE ON FUNCTION public.reset_seeded_data() TO authenticated;