-- Add missing columns to profiles table for unified settings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS roles TEXT[],
ADD COLUMN IF NOT EXISTS display_name TEXT;