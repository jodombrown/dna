-- Add granular email preferences columns to adin_preferences
ALTER TABLE public.adin_preferences
ADD COLUMN IF NOT EXISTS email_connections boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_reactions boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_comments boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_messages boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_mentions boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_events boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_stories boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS unsubscribe_token uuid DEFAULT gen_random_uuid();

-- Create unique index on unsubscribe_token for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_adin_preferences_unsubscribe_token 
ON public.adin_preferences(unsubscribe_token);

-- Update existing rows to have unsubscribe tokens
UPDATE public.adin_preferences 
SET unsubscribe_token = gen_random_uuid() 
WHERE unsubscribe_token IS NULL;

-- Add comment explaining the columns
COMMENT ON COLUMN public.adin_preferences.email_connections IS 'Email for connection requests/accepts';
COMMENT ON COLUMN public.adin_preferences.email_reactions IS 'Email for post reactions';
COMMENT ON COLUMN public.adin_preferences.email_comments IS 'Email for comments on posts';
COMMENT ON COLUMN public.adin_preferences.email_messages IS 'Email for direct messages';
COMMENT ON COLUMN public.adin_preferences.email_mentions IS 'Email for @mentions';
COMMENT ON COLUMN public.adin_preferences.email_events IS 'Email for event reminders/updates';
COMMENT ON COLUMN public.adin_preferences.email_stories IS 'Email for story notifications';
COMMENT ON COLUMN public.adin_preferences.unsubscribe_token IS 'Secure token for one-click email unsubscribe';