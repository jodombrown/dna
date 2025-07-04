-- Add missing columns to posts table for enhanced content types
ALTER TABLE public.posts 
ADD COLUMN banner_url TEXT,
ADD COLUMN location TEXT,
ADD COLUMN date_time TIMESTAMP WITH TIME ZONE;