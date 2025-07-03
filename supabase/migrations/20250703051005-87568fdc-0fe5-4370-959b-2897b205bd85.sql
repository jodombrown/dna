
-- Create community_memberships table
CREATE TABLE public.community_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure a user can only have one membership per community
  UNIQUE(user_id, community_id)
);

-- Enable RLS on community_memberships table
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for community_memberships table
CREATE POLICY "Users can view community memberships" ON public.community_memberships
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own memberships" ON public.community_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memberships" ON public.community_memberships
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own memberships" ON public.community_memberships
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_community_memberships_user_id ON public.community_memberships(user_id);
CREATE INDEX idx_community_memberships_community_id ON public.community_memberships(community_id);
