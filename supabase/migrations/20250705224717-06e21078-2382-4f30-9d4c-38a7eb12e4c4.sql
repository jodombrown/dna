-- Create posts table aligned with DNA's three pillars
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  pillar TEXT CHECK (pillar IN ('connect', 'collaborate', 'contribute')) NOT NULL,
  hashtags TEXT[],
  visibility TEXT DEFAULT 'public', -- future use: 'private', 'community', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts access
CREATE POLICY "Public posts are viewable by everyone" 
ON public.posts 
FOR SELECT 
USING (visibility = 'public');

CREATE POLICY "Users can view their own posts" 
ON public.posts 
FOR SELECT 
USING (auth.uid() = author_id);

CREATE POLICY "Users can create their own posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" 
ON public.posts 
FOR DELETE 
USING (auth.uid() = author_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_posts_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_pillar ON public.posts(pillar);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_hashtags ON public.posts USING GIN(hashtags);
CREATE INDEX idx_posts_visibility ON public.posts(visibility);