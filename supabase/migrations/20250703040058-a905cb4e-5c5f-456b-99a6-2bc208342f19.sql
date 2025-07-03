
-- Create storage bucket for profile pictures if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the profile-pictures bucket
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can update their own profile pictures" ON storage.objects
FOR UPDATE USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
FOR DELETE USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Ensure the profiles table has the necessary columns (most already exist)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_country TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_role TEXT;
