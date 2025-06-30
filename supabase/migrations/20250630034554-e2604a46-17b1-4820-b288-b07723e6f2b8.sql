
-- Enable RLS on tables if not already enabled
DO $$ 
BEGIN
    -- Enable RLS on profiles (skip if already enabled)
    BEGIN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore if already enabled
    END;
    
    -- Enable RLS on posts (skip if already enabled)
    BEGIN
        ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    -- Enable RLS on events (skip if already enabled)
    BEGIN
        ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    -- Enable RLS on communities (skip if already enabled)
    BEGIN
        ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
END $$;

-- Drop existing policies if they exist, then create new ones
-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles 
  FOR SELECT 
  USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Posts policies
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can view own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

CREATE POLICY "Published posts are viewable by everyone" 
  ON public.posts 
  FOR SELECT 
  USING (is_published = true AND (moderation_status = 'approved' OR auth.uid() = user_id));

CREATE POLICY "Users can insert own posts" 
  ON public.posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" 
  ON public.posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" 
  ON public.posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Events policies  
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;

CREATE POLICY "Events are viewable by everyone" 
  ON public.events 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create events" 
  ON public.events 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own events" 
  ON public.events 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own events" 
  ON public.events 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Communities policies
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON public.communities;
DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;
DROP POLICY IF EXISTS "Users can update own communities" ON public.communities;
DROP POLICY IF EXISTS "Users can delete own communities" ON public.communities;

CREATE POLICY "Communities are viewable by everyone" 
  ON public.communities 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create communities" 
  ON public.communities 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own communities" 
  ON public.communities 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own communities" 
  ON public.communities 
  FOR DELETE 
  USING (auth.uid() = created_by);
