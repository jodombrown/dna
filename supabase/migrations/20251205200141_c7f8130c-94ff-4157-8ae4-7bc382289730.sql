-- Add my_dna_statement column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS my_dna_statement text;