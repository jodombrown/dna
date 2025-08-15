-- Add visibility column to profiles table for privacy settings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS visibility JSONB DEFAULT '{"full_name": "public", "headline": "public", "bio": "public", "location": "public", "company": "public", "skills": "public", "links": "public"}'::jsonb;