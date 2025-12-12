-- Phase 3: Add consent and communication preference columns
-- These support GDPR/CCPA compliance and user control over communications

-- Marketing consent - receiving promotional emails
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS consent_marketing_emails boolean DEFAULT true;

-- Partner introductions consent - being introduced to ecosystem partners
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS consent_partner_intros boolean DEFAULT true;

-- Event invitations consent - receiving event invitations
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS consent_event_invites boolean DEFAULT true;

-- Public search consent - appearing in public search results
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS consent_public_search boolean DEFAULT true;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.consent_marketing_emails IS 'User consents to receive marketing and promotional emails';
COMMENT ON COLUMN public.profiles.consent_partner_intros IS 'User consents to be introduced to DNA ecosystem partners';
COMMENT ON COLUMN public.profiles.consent_event_invites IS 'User consents to receive event invitation emails';
COMMENT ON COLUMN public.profiles.consent_public_search IS 'User consents to appearing in public search results';