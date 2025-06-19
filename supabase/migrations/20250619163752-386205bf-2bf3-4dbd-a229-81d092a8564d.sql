
-- Enable RLS on tables that don't have it yet (skip if already enabled)
DO $$ 
BEGIN
    -- Enable RLS on tables (will skip if already enabled)
    BEGIN
        ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore if already enabled
    END;
    
    BEGIN
        ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.project_participants ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
END $$;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create RLS policies for profiles
CREATE POLICY "Users can view public profiles" ON public.profiles FOR SELECT USING (
  is_public = true OR auth.uid() = id
);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (
  auth.uid() = id
);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (
  auth.uid() = id
);

-- Create RLS policies for events (drop first if exists)
DROP POLICY IF EXISTS "Everyone can view events" ON public.events;
DROP POLICY IF EXISTS "Users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;

CREATE POLICY "Everyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON public.events FOR INSERT WITH CHECK (
  auth.uid() = created_by
);
CREATE POLICY "Users can update their own events" ON public.events FOR UPDATE USING (
  auth.uid() = created_by
);

-- Create RLS policies for communities
DROP POLICY IF EXISTS "Everyone can view communities" ON public.communities;
DROP POLICY IF EXISTS "Users can create communities" ON public.communities;
DROP POLICY IF EXISTS "Users can update their own communities" ON public.communities;

CREATE POLICY "Everyone can view communities" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Users can create communities" ON public.communities FOR INSERT WITH CHECK (
  auth.uid() = created_by
);
CREATE POLICY "Users can update their own communities" ON public.communities FOR UPDATE USING (
  auth.uid() = created_by
);

-- Create RLS policies for community memberships
DROP POLICY IF EXISTS "Users can view community memberships" ON public.community_memberships;
DROP POLICY IF EXISTS "Users can join communities" ON public.community_memberships;
DROP POLICY IF EXISTS "Users can leave communities" ON public.community_memberships;

CREATE POLICY "Users can view community memberships" ON public.community_memberships FOR SELECT USING (true);
CREATE POLICY "Users can join communities" ON public.community_memberships FOR INSERT WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "Users can leave communities" ON public.community_memberships FOR DELETE USING (
  auth.uid() = user_id
);

-- Create RLS policies for messages
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON public.messages;

CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);
CREATE POLICY "Users can update their received messages" ON public.messages FOR UPDATE USING (
  auth.uid() = recipient_id
);

-- Create RLS policies for connections
DROP POLICY IF EXISTS "Users can view their connections" ON public.connections;
DROP POLICY IF EXISTS "Users can create connection requests" ON public.connections;
DROP POLICY IF EXISTS "Users can update connections they're involved in" ON public.connections;

CREATE POLICY "Users can view their connections" ON public.connections FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can create connection requests" ON public.connections FOR INSERT WITH CHECK (
  auth.uid() = requester_id
);
CREATE POLICY "Users can update connections they're involved in" ON public.connections FOR UPDATE USING (
  auth.uid() = requester_id OR auth.uid() = recipient_id
);
