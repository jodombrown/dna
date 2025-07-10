-- Create user_connections table for follower/following relationships
CREATE TABLE IF NOT EXISTS public.user_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create community_memberships table
CREATE TABLE IF NOT EXISTS public.community_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure a user can only have one membership per community
  UNIQUE(user_id, community_id)
);

-- Enable RLS on both tables
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_connections table
CREATE POLICY "Users can view their connections" ON public.user_connections
  FOR SELECT USING (
    auth.uid() = follower_id OR auth.uid() = following_id
  );

CREATE POLICY "Users can create their own connections" ON public.user_connections
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own connections" ON public.user_connections
  FOR DELETE USING (auth.uid() = follower_id);

-- Create RLS policies for community_memberships table
CREATE POLICY "Users can view community memberships" ON public.community_memberships
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own memberships" ON public.community_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships" ON public.community_memberships
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own memberships" ON public.community_memberships
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_connections_follower_id ON public.user_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_following_id ON public.user_connections(following_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_user_id ON public.community_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_community_id ON public.community_memberships(community_id);