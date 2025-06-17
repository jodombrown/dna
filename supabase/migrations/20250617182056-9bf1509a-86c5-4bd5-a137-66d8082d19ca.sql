
-- Create user_connections table for following/follower relationships
CREATE TABLE public.user_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create connections table for connection requests
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

-- Enable RLS on new tables
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_connections
CREATE POLICY "Users can view connections" ON public.user_connections FOR SELECT USING (
  auth.uid() = follower_id OR auth.uid() = following_id
);
CREATE POLICY "Users can create connections" ON public.user_connections FOR INSERT WITH CHECK (
  auth.uid() = follower_id
);
CREATE POLICY "Users can delete their connections" ON public.user_connections FOR DELETE USING (
  auth.uid() = follower_id
);

-- Create RLS policies for connections
CREATE POLICY "Users can view their connections" ON public.connections FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can create connection requests" ON public.connections FOR INSERT WITH CHECK (
  auth.uid() = requester_id
);
CREATE POLICY "Users can update connections they're involved in" ON public.connections FOR UPDATE USING (
  auth.uid() = requester_id OR auth.uid() = recipient_id
);

-- Update profiles table to have proper foreign key relationship
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update posts table to have proper foreign key relationship  
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE public.posts ADD CONSTRAINT posts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
