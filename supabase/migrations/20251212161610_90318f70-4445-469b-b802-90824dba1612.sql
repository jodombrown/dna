-- Phase 2: Add critical contact and identity fields
-- These fields support the "complete profile" data model for DNA

-- Pronouns (identity)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pronouns text;

-- WhatsApp number (contact channel)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- Preferred contact method (contact preferences)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_contact_method text;

-- Timezone (scheduling/availability)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS timezone text;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.pronouns IS 'User preferred pronouns (e.g., he/him, she/her, they/them)';
COMMENT ON COLUMN public.profiles.whatsapp_number IS 'WhatsApp contact number with country code';
COMMENT ON COLUMN public.profiles.preferred_contact_method IS 'Preferred way to be contacted (email, whatsapp, linkedin, platform_message)';
COMMENT ON COLUMN public.profiles.timezone IS 'User timezone for scheduling (e.g., America/New_York, Africa/Lagos)';