-- Create post_comments table for threaded commenting system
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_post_comments_parent_id ON public.post_comments(parent_id);
CREATE INDEX idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX idx_post_comments_created_at ON public.post_comments(created_at DESC);

-- Enable Row-Level Security
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Allow read for everyone (comments are public like posts)
CREATE POLICY "Allow all users to read comments"
ON public.post_comments FOR SELECT USING (true);

-- Allow insert for authenticated users
CREATE POLICY "Allow insert for logged-in users"
ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow update for comment authors only (for editing)
CREATE POLICY "Allow users to update their own comments"
ON public.post_comments FOR UPDATE USING (auth.uid() = user_id);

-- Allow delete by comment author or admins
CREATE POLICY "Allow users to delete their own comments"
ON public.post_comments FOR DELETE USING (
  auth.uid() = user_id OR 
  is_admin_user(auth.uid())
);

-- Add trigger for updating updated_at timestamp
CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();