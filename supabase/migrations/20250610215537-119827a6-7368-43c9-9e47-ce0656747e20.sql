
-- Add missing columns to existing profiles table if they don't exist
DO $$ 
BEGIN
  -- Add skills column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'skills') THEN
    ALTER TABLE public.profiles ADD COLUMN skills TEXT[];
  END IF;
  
  -- Add interests column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interests') THEN
    ALTER TABLE public.profiles ADD COLUMN interests TEXT[];
  END IF;
  
  -- Add profile_picture_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_picture_url') THEN
    ALTER TABLE public.profiles ADD COLUMN profile_picture_url TEXT;
  END IF;
  
  -- Add is_public column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_public') THEN
    ALTER TABLE public.profiles ADD COLUMN is_public BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Create storage bucket for profile pictures (ignore if exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for profile pictures (drop and recreate to ensure they're correct)
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

CREATE POLICY "Users can upload their own profile pictures"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-pictures' AND (select auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view profile pictures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can update their own profile pictures"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-pictures' AND (select auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile pictures"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'profile-pictures' AND (select auth.uid())::text = (storage.foldername(name))[1]);

-- Add RLS policies for profiles if they don't exist
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view public profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (is_public = true OR (select auth.uid()) = id);

CREATE POLICY "Users can create their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING ((select auth.uid()) = id);
