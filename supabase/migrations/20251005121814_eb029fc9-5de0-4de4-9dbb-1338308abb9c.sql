-- Add years_in_diaspora_text column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS years_in_diaspora_text TEXT;