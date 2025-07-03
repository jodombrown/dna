
-- Create newsletter_deliveries table to track email sends
CREATE TABLE public.newsletter_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  newsletter_id UUID NOT NULL REFERENCES public.newsletters(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add email preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS newsletter_emails BOOLEAN DEFAULT true;

-- Add email tracking to newsletters table
ALTER TABLE public.newsletters 
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_recipient_count INTEGER DEFAULT 0;

-- Enable RLS on newsletter_deliveries
ALTER TABLE public.newsletter_deliveries ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter_deliveries
CREATE POLICY "Authors can view their newsletter deliveries" 
  ON public.newsletter_deliveries 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.newsletters 
      WHERE newsletters.id = newsletter_deliveries.newsletter_id 
      AND newsletters.created_by = (select auth.uid())
    )
  );

CREATE POLICY "System can insert newsletter deliveries" 
  ON public.newsletter_deliveries 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_deliveries_newsletter_id ON public.newsletter_deliveries(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_deliveries_recipient_id ON public.newsletter_deliveries(recipient_id);
CREATE INDEX IF NOT EXISTS idx_profiles_newsletter_emails ON public.profiles(newsletter_emails) WHERE newsletter_emails = true;

-- Create function to get newsletter followers
CREATE OR REPLACE FUNCTION public.get_newsletter_followers(newsletter_user_id UUID)
RETURNS TABLE(user_id UUID, email TEXT, full_name TEXT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id as user_id,
    p.email,
    p.full_name
  FROM public.profiles p
  WHERE p.newsletter_emails = true
    AND p.email IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.follows f 
      WHERE f.target_type = 'user' 
      AND f.target_id = newsletter_user_id::text 
      AND f.follower_id = p.id
    );
$$;
