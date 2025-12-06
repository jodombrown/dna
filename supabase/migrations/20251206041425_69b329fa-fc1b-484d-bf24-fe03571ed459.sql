-- Drop the old constraint and add a new one with correct values
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type = ANY (ARRAY['individual'::text, 'organization'::text, 'diaspora_professional'::text, 'founder'::text, 'ally'::text]));