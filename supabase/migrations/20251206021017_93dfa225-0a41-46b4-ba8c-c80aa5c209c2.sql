-- Add organization_name column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_name text;