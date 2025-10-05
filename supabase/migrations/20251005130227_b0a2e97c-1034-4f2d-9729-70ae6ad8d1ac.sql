-- Add why_contribute column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS why_contribute TEXT;