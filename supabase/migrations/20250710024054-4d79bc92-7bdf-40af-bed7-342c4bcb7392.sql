-- Add join request status to community_memberships
ALTER TABLE public.community_memberships 
ADD COLUMN status TEXT NOT NULL DEFAULT 'approved',
ADD COLUMN requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN approved_by UUID REFERENCES auth.users(id);

-- Create community_posts table for activity logs and updates
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'update', -- 'update', 'event', 'announcement'
  media_url TEXT,
  event_date TIMESTAMP WITH TIME ZONE, -- For event posts
  event_location TEXT, -- For event posts
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_events table for dedicated events
CREATE TABLE public.community_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  max_attendees INTEGER,
  registration_required BOOLEAN DEFAULT false,
  registration_url TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'completed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_event_attendees table
CREATE TABLE public.community_event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.community_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'attending', -- 'attending', 'maybe', 'not_attending'
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_event_attendees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_posts
CREATE POLICY "Community posts viewable by community members" ON public.community_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_memberships cm 
      WHERE cm.community_id = community_posts.community_id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'approved'
    ) OR 
    EXISTS (
      SELECT 1 FROM public.communities c 
      WHERE c.id = community_posts.community_id 
      AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Community members can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    (EXISTS (
      SELECT 1 FROM public.community_memberships cm 
      WHERE cm.community_id = community_posts.community_id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'approved'
    ) OR 
    EXISTS (
      SELECT 1 FROM public.communities c 
      WHERE c.id = community_posts.community_id 
      AND c.created_by = auth.uid()
    ))
  );

CREATE POLICY "Authors can update their own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors and community admins can delete posts" ON public.community_posts
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM public.communities c 
      WHERE c.id = community_posts.community_id 
      AND c.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.community_memberships cm 
      WHERE cm.community_id = community_posts.community_id 
      AND cm.user_id = auth.uid() 
      AND cm.role = 'admin'
    )
  );

-- RLS Policies for community_events
CREATE POLICY "Community events viewable by community members" ON public.community_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_memberships cm 
      WHERE cm.community_id = community_events.community_id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'approved'
    ) OR 
    EXISTS (
      SELECT 1 FROM public.communities c 
      WHERE c.id = community_events.community_id 
      AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Community members can create events" ON public.community_events
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    (EXISTS (
      SELECT 1 FROM public.community_memberships cm 
      WHERE cm.community_id = community_events.community_id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'approved'
    ) OR 
    EXISTS (
      SELECT 1 FROM public.communities c 
      WHERE c.id = community_events.community_id 
      AND c.created_by = auth.uid()
    ))
  );

CREATE POLICY "Event creators can update their events" ON public.community_events
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Event creators and community admins can delete events" ON public.community_events
  FOR DELETE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.communities c 
      WHERE c.id = community_events.community_id 
      AND c.created_by = auth.uid()
    )
  );

-- RLS Policies for community_event_attendees
CREATE POLICY "Event attendees viewable by community members" ON public.community_event_attendees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_events ce
      JOIN public.community_memberships cm ON cm.community_id = ce.community_id
      WHERE ce.id = community_event_attendees.event_id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'approved'
    )
  );

CREATE POLICY "Users can manage their own event attendance" ON public.community_event_attendees
  FOR ALL USING (auth.uid() = user_id);

-- Update community_memberships RLS policies to handle join requests
DROP POLICY "Users can create their own memberships" ON public.community_memberships;
DROP POLICY "Users can update their own memberships" ON public.community_memberships;

CREATE POLICY "Users can request to join communities" ON public.community_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Community admins can approve/reject join requests" ON public.community_memberships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.communities c 
      WHERE c.id = community_memberships.community_id 
      AND c.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.community_memberships cm 
      WHERE cm.community_id = community_memberships.community_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('admin', 'moderator')
      AND cm.status = 'approved'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_community_posts_community_id ON public.community_posts(community_id);
CREATE INDEX idx_community_posts_author_id ON public.community_posts(author_id);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_events_community_id ON public.community_events(community_id);
CREATE INDEX idx_community_events_event_date ON public.community_events(event_date);
CREATE INDEX idx_community_event_attendees_event_id ON public.community_event_attendees(event_id);
CREATE INDEX idx_community_memberships_status ON public.community_memberships(status);

-- Create trigger for updating timestamps
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_events_updated_at
  BEFORE UPDATE ON public.community_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();