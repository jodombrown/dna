-- Add is_seeded column to remaining tables that might have seed data
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS is_seeded BOOLEAN DEFAULT false;
ALTER TABLE public.post_likes ADD COLUMN IF NOT EXISTS is_seeded BOOLEAN DEFAULT false;

-- Create function to reset all seeded data
CREATE OR REPLACE FUNCTION public.reset_seeded_data()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
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
  RAISE NOTICE 'All seeded data has been reset successfully';
END;
$$;

-- Grant execute permission to authenticated users (admins)
GRANT EXECUTE ON FUNCTION public.reset_seeded_data() TO authenticated;