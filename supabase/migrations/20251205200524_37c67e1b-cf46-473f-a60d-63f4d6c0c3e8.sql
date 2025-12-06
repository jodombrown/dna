-- Add organization_category column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS organization_category text;