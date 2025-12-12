-- Add pinned and deleted columns to conversations table
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS is_pinned_by_a boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pinned_by_b boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_by_a boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_by_b boolean DEFAULT false;