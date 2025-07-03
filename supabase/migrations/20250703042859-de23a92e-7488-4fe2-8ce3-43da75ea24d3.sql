
-- Create follows table to track user follows across different entity types
CREATE TABLE public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'tag', 'initiative')),
  target_id TEXT NOT NULL, -- Using TEXT to accommodate different ID formats (UUID for users/initiatives, string for tags)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure a user can only follow the same target once
  UNIQUE(follower_id, target_type, target_id)
);

-- Enable RLS on follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for follows table
CREATE POLICY "Users can view follows" ON public.follows
  FOR SELECT USING (true); -- Anyone can see who follows what (for public discovery)

CREATE POLICY "Users can create their own follows" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Create indexes for better performance
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_target ON public.follows(target_type, target_id);
CREATE INDEX idx_follows_created_at ON public.follows(created_at DESC);
