
-- Track onboarding steps in profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_status jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS profile_completed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS first_community_joined_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS first_connection_made_at timestamp with time zone;

-- Optional: Log actual onboarding events for deeper analytics
CREATE TABLE IF NOT EXISTS public.onboarding_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL references public.profiles(id),
  event_type text NOT NULL, -- ("profile_completed", "community_joined", "sent_first_connection", etc)
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS: Only user can see their onboarding events
ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can access their onboarding events"
ON public.onboarding_events
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
