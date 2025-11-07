-- Add linkedin_url to beta_waitlist table
ALTER TABLE public.beta_waitlist 
ADD COLUMN IF NOT EXISTS linkedin_url text;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_status ON public.beta_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_created_at ON public.beta_waitlist(created_at DESC);