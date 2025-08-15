-- Add individual URL columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT;