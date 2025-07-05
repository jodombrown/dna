-- Create comments table for threaded post discussions
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- for threaded replies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments access
CREATE POLICY "Comments are viewable by everyone" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = author_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_comments_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_author_id ON public.comments(author_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);