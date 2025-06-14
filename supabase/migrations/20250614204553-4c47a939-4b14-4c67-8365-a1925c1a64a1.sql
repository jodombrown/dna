
-- Enable Row Level Security on both tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view (SELECT) all events and communities
CREATE POLICY "Allow public read events"
  ON public.events
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read communities"
  ON public.communities
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can INSERT events/communities (and their user_id is set as created_by)
CREATE POLICY "Allow users to create events"
  ON public.events
  FOR INSERT
  WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Allow users to create communities"
  ON public.communities
  FOR INSERT
  WITH CHECK (auth.uid()::text = created_by::text);

-- Policy: Only creator can UPDATE or DELETE their own events/communities (split into two separate policies each)
CREATE POLICY "Allow user to update own event"
  ON public.events
  FOR UPDATE
  USING (auth.uid()::text = created_by::text);

CREATE POLICY "Allow user to delete own event"
  ON public.events
  FOR DELETE
  USING (auth.uid()::text = created_by::text);

CREATE POLICY "Allow user to update own community"
  ON public.communities
  FOR UPDATE
  USING (auth.uid()::text = created_by::text);

CREATE POLICY "Allow user to delete own community"
  ON public.communities
  FOR DELETE
  USING (auth.uid()::text = created_by::text);

-- Make sure both created_by columns default to auth.uid() if not set by client
ALTER TABLE public.events ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.communities ALTER COLUMN created_by SET DEFAULT auth.uid();
