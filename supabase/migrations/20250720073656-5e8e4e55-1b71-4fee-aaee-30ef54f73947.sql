-- Fix storage policies for profile image uploads
-- This ensures users can upload to their own folders in the storage buckets

-- Update INSERT policies for profile-pictures bucket
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Update INSERT policies for profile-images bucket  
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Ensure profiles have a username field for clean URLs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add index for username lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- Add function to generate username from full_name
CREATE OR REPLACE FUNCTION public.generate_username_from_name(full_name TEXT)
RETURNS TEXT AS $$
BEGIN
  IF full_name IS NULL OR full_name = '' THEN
    RETURN NULL;
  END IF;
  
  -- Convert to lowercase, replace spaces with dashes, remove special chars
  RETURN lower(
    regexp_replace(
      regexp_replace(trim(full_name), '[^a-zA-Z0-9\s]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add trigger to automatically set username when profile is created/updated
CREATE OR REPLACE FUNCTION public.set_profile_username()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set username if it's not already set and we have a full_name
  IF NEW.username IS NULL AND NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN
    NEW.username = public.generate_username_from_name(NEW.full_name);
    
    -- Handle duplicates by appending a number
    DECLARE
      base_username TEXT := NEW.username;
      counter INTEGER := 1;
    BEGIN
      WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = NEW.username AND id != NEW.id) LOOP
        NEW.username = base_username || '-' || counter;
        counter = counter + 1;
      END LOOP;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for username generation
DROP TRIGGER IF EXISTS set_profile_username_trigger ON public.profiles;
CREATE TRIGGER set_profile_username_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profile_username();