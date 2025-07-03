
-- Create communities table
CREATE TABLE public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT,
  purpose_goals TEXT,
  category TEXT,
  tags TEXT[],
  cover_image_url TEXT,
  member_count INTEGER DEFAULT 1, -- Creator is automatically a member
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_memberships table
CREATE TABLE public.community_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'moderator', 'member'
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate memberships
  UNIQUE(user_id, community_id)
);

-- Enable RLS on both tables
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communities table
CREATE POLICY "Communities viewable by everyone" ON public.communities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create communities" ON public.communities
  FOR INSERT WITH CHECK (auth.uid() = creator_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Community creators can update their communities" ON public.communities
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Community creators can delete their communities" ON public.communities
  FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for community_memberships table
CREATE POLICY "Community memberships viewable by members" ON public.community_memberships
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.community_memberships cm 
      WHERE cm.community_id = community_memberships.community_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join communities" ON public.community_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can leave communities" ON public.community_memberships
  FOR DELETE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.community_memberships cm 
      WHERE cm.community_id = community_memberships.community_id 
      AND cm.user_id = auth.uid() 
      AND cm.role = 'admin'
    )
  );

CREATE POLICY "Community admins can update member roles" ON public.community_memberships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.community_memberships cm 
      WHERE cm.community_id = community_memberships.community_id 
      AND cm.user_id = auth.uid() 
      AND cm.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_communities_creator ON public.communities(creator_id);
CREATE INDEX idx_communities_category ON public.communities(category);
CREATE INDEX idx_communities_active ON public.communities(is_active);
CREATE INDEX idx_community_memberships_user ON public.community_memberships(user_id);
CREATE INDEX idx_community_memberships_community ON public.community_memberships(community_id);
CREATE INDEX idx_community_memberships_role ON public.community_memberships(role);

-- Function to automatically create admin membership when community is created
CREATE OR REPLACE FUNCTION public.create_community_admin_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.community_memberships (user_id, community_id, role)
  VALUES (NEW.creator_id, NEW.id, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically make creator an admin member
CREATE TRIGGER on_community_created
  AFTER INSERT ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.create_community_admin_membership();

-- Function to update member count when memberships change
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities 
    SET member_count = member_count + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities 
    SET member_count = member_count - 1 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to maintain member count
CREATE TRIGGER on_membership_added
  AFTER INSERT ON public.community_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_community_member_count();

CREATE TRIGGER on_membership_removed
  AFTER DELETE ON public.community_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_community_member_count();
