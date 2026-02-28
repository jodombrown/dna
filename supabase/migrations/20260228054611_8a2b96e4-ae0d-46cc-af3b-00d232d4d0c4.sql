
-- Create sponsors table
CREATE TABLE public.sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  description text,
  website_url text,
  tier text NOT NULL DEFAULT 'community',
  contact_name text,
  contact_email text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create sponsor_placements table
CREATE TABLE public.sponsor_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  placement text NOT NULL,
  headline text,
  cta_label text DEFAULT 'Learn More',
  cta_url text,
  priority int NOT NULL DEFAULT 10,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  impression_count bigint NOT NULL DEFAULT 0,
  click_count bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_placements ENABLE ROW LEVEL SECURITY;

-- Read access for all authenticated users
CREATE POLICY "Authenticated users can view active sponsors"
  ON public.sponsors FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view active placements"
  ON public.sponsor_placements FOR SELECT TO authenticated
  USING (true);

-- Admin write access using existing is_admin_user RPC
CREATE POLICY "Admins can insert sponsors"
  ON public.sponsors FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update sponsors"
  ON public.sponsors FOR UPDATE TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete sponsors"
  ON public.sponsors FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can insert placements"
  ON public.sponsor_placements FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update placements"
  ON public.sponsor_placements FOR UPDATE TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete placements"
  ON public.sponsor_placements FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- Allow authenticated users to increment impression/click counts
CREATE POLICY "Users can increment placement analytics"
  ON public.sponsor_placements FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Updated_at trigger for sponsors
CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RPC for tracking impressions (increment safely)
CREATE OR REPLACE FUNCTION public.track_sponsor_impression(placement_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE sponsor_placements
  SET impression_count = impression_count + 1
  WHERE id = placement_id;
$$;

-- RPC for tracking clicks
CREATE OR REPLACE FUNCTION public.track_sponsor_click(placement_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE sponsor_placements
  SET click_count = click_count + 1
  WHERE id = placement_id;
$$;

-- Seed GABA Center
INSERT INTO public.sponsors (name, slug, logo_url, description, website_url, tier, is_active)
VALUES (
  'GABA Marketplace Center',
  'gaba-center',
  'https://gabanetwork.com/wp-content/uploads/2023/01/GABA-Logo.png',
  'Empowering African & Caribbean entrepreneurs. WBENC Certified.',
  'https://gabanetwork.com/',
  'gold',
  true
);

INSERT INTO public.sponsor_placements (sponsor_id, placement, headline, cta_label, cta_url, priority, is_active)
VALUES (
  (SELECT id FROM public.sponsors WHERE slug = 'gaba-center'),
  'feed_sidebar',
  'Empowering African & Caribbean entrepreneurs',
  'Learn More',
  'https://gabanetwork.com/',
  1,
  true
);
