-- Create user_communities table for user-created communities
CREATE TABLE public.user_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  tags TEXT[],
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_communities ENABLE ROW LEVEL SECURITY;

-- Create policies for user_communities access
CREATE POLICY "User communities are viewable by everyone" 
ON public.user_communities 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own communities" 
ON public.user_communities 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own communities" 
ON public.user_communities 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own communities" 
ON public.user_communities 
FOR DELETE 
USING (auth.uid() = owner_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_communities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_communities_updated_at
BEFORE UPDATE ON public.user_communities
FOR EACH ROW
EXECUTE FUNCTION public.update_user_communities_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_user_communities_owner_id ON public.user_communities(owner_id);
CREATE INDEX idx_user_communities_name ON public.user_communities(name);
CREATE INDEX idx_user_communities_location ON public.user_communities(location);
CREATE INDEX idx_user_communities_tags ON public.user_communities USING GIN(tags);
CREATE INDEX idx_user_communities_created_at ON public.user_communities(created_at DESC);