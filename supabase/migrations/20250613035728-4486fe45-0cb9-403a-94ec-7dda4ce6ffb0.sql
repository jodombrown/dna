
-- Add new columns to profiles table for comprehensive diaspora profile
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_image_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS diaspora_origin TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS my_dna_statement TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS impact_areas TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS engagement_intentions TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills_offered TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills_needed TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS past_contributions TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS available_for TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_visibility TEXT DEFAULT 'public';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;

-- Create table for user connections/follows
CREATE TABLE IF NOT EXISTS public.user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create table for projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  impact_area TEXT,
  status TEXT DEFAULT 'active',
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for project participants
CREATE TABLE IF NOT EXISTS public.project_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_role TEXT DEFAULT 'participant',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create table for initiatives
CREATE TABLE IF NOT EXISTS public.initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  impact_area TEXT,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_connections
CREATE POLICY "Users can view connections" ON public.user_connections FOR SELECT USING (true);
CREATE POLICY "Users can create connections" ON public.user_connections FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their connections" ON public.user_connections FOR DELETE USING (auth.uid() = follower_id);

-- RLS policies for projects
CREATE POLICY "Users can view public projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Project creators can update projects" ON public.projects FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Project creators can delete projects" ON public.projects FOR DELETE USING (auth.uid() = creator_id);

-- RLS policies for project_participants
CREATE POLICY "Users can view project participants" ON public.project_participants FOR SELECT USING (true);
CREATE POLICY "Users can join projects" ON public.project_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave projects" ON public.project_participants FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for initiatives
CREATE POLICY "Users can view initiatives" ON public.initiatives FOR SELECT USING (true);
CREATE POLICY "Users can create initiatives" ON public.initiatives FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Initiative creators can update initiatives" ON public.initiatives FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Initiative creators can delete initiatives" ON public.initiatives FOR DELETE USING (auth.uid() = creator_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_connections_follower ON public.user_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_following ON public.user_connections(following_id);
CREATE INDEX IF NOT EXISTS idx_projects_creator ON public.projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_impact_area ON public.projects(impact_area);
CREATE INDEX IF NOT EXISTS idx_project_participants_project ON public.project_participants(project_id);
CREATE INDEX IF NOT EXISTS idx_project_participants_user ON public.project_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_creator ON public.initiatives(creator_id);
CREATE INDEX IF NOT EXISTS idx_profiles_diaspora_origin ON public.profiles(diaspora_origin);
CREATE INDEX IF NOT EXISTS idx_profiles_impact_areas ON public.profiles USING GIN(impact_areas);
CREATE INDEX IF NOT EXISTS idx_profiles_engagement_intentions ON public.profiles USING GIN(engagement_intentions);

-- Add comments for the new fields
COMMENT ON COLUMN public.profiles.headline IS 'Professional headline similar to LinkedIn';
COMMENT ON COLUMN public.profiles.banner_image_url IS 'Profile banner/cover image URL';
COMMENT ON COLUMN public.profiles.city IS 'Current city of residence';
COMMENT ON COLUMN public.profiles.diaspora_origin IS 'Country/region of diaspora origin';
COMMENT ON COLUMN public.profiles.my_dna_statement IS 'Personal DNA statement describing diaspora journey';
COMMENT ON COLUMN public.profiles.impact_areas IS 'Areas where user wants to make impact';
COMMENT ON COLUMN public.profiles.engagement_intentions IS 'How user wants to engage (Connect, Collaborate, Contribute)';
COMMENT ON COLUMN public.profiles.professional_role IS 'Current professional role/title';
COMMENT ON COLUMN public.profiles.organization IS 'Current organization/company';
COMMENT ON COLUMN public.profiles.industry IS 'Professional industry';
COMMENT ON COLUMN public.profiles.followers_count IS 'Number of followers';
COMMENT ON COLUMN public.profiles.following_count IS 'Number of people following';
COMMENT ON COLUMN public.profiles.skills_offered IS 'Skills user can offer for collaboration';
COMMENT ON COLUMN public.profiles.skills_needed IS 'Skills user is looking for';
COMMENT ON COLUMN public.profiles.past_contributions IS 'Description of past contributions';
COMMENT ON COLUMN public.profiles.available_for IS 'What user is available for (mentorship, funding, etc)';
COMMENT ON COLUMN public.profiles.account_visibility IS 'Profile visibility setting';
COMMENT ON COLUMN public.profiles.notifications_enabled IS 'Whether notifications are enabled';
