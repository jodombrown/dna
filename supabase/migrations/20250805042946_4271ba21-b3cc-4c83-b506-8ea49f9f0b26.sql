-- Add new fields for personalized onboarding and user intent
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type text CHECK (user_type IN ('diaspora_professional', 'founder', 'ally'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selected_pillars text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS what_to_give text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS what_to_receive text[] DEFAULT '{}';

-- Founder-specific fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS venture_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS venture_stage text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fundraising_status text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS collaboration_needs text[];

-- Professional-specific fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mentorship_interest text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS impact_goals text[];

-- Ally-specific fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS support_areas text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS advocacy_interests text[];

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.user_type IS 'Type of user: diaspora_professional, founder, or ally';
COMMENT ON COLUMN public.profiles.selected_pillars IS 'DNA pillars user is interested in: connect, collaborate, contribute';
COMMENT ON COLUMN public.profiles.what_to_give IS 'What user wants to offer: mentorship, capital, network, skills, advocacy';
COMMENT ON COLUMN public.profiles.what_to_receive IS 'What user wants to receive: collaborators, learning, funding, tools, visibility';