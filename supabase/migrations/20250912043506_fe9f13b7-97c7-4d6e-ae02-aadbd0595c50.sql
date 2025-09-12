-- Add missing payload column to notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS payload JSONB;