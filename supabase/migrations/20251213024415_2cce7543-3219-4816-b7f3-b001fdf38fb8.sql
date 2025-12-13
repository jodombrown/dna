-- Add missing columns for unified contact visibility model
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT NULL,
ADD COLUMN IF NOT EXISTS contact_number_visibility TEXT NOT NULL DEFAULT 'none';

-- Add available_for column if not exists (for "Open to" collaboration types)
-- Note: available_for already exists per schema check

COMMENT ON COLUMN public.profiles.contact_number_visibility IS 'Controls which number shows publicly: none, phone, or whatsapp';
COMMENT ON COLUMN public.profiles.phone_number IS 'User phone number (only shown if contact_number_visibility = phone)';