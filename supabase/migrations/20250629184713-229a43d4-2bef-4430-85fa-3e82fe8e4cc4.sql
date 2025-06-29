
-- Create enum for flag types
CREATE TYPE public.flag_type AS ENUM (
  'inappropriate_content',
  'spam',
  'harassment',
  'misinformation',
  'copyright_violation',
  'other'
);

-- Create enum for moderation status
CREATE TYPE public.moderation_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'hidden',
  'deleted'
);

-- Create content_flags table to track reported content
CREATE TABLE public.content_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'post', 'comment', 'profile', etc.
  content_id UUID NOT NULL, -- ID of the flagged content
  flagged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  flag_type flag_type NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status moderation_status NOT NULL DEFAULT 'pending',
  moderator_notes TEXT
);

-- Create index for faster queries
CREATE INDEX idx_content_flags_status ON public.content_flags(status);
CREATE INDEX idx_content_flags_content ON public.content_flags(content_type, content_id);
CREATE INDEX idx_content_flags_created_at ON public.content_flags(created_at DESC);

-- Enable RLS
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_flags
-- Users can only see flags they created
CREATE POLICY "Users can view their own flags" 
  ON public.content_flags 
  FOR SELECT 
  USING (flagged_by = auth.uid());

-- Users can create flags
CREATE POLICY "Users can create flags" 
  ON public.content_flags 
  FOR INSERT 
  WITH CHECK (flagged_by = auth.uid());

-- Admin/moderators can see all flags
CREATE POLICY "Admins and moderators can view all flags" 
  ON public.content_flags 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND role IN ('super_admin', 'content_moderator')
    )
  );

-- Admin/moderators can update flags (resolve them)
CREATE POLICY "Admins and moderators can update flags" 
  ON public.content_flags 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND role IN ('super_admin', 'content_moderator')
    )
  );

-- Add moderation_status column to posts table
ALTER TABLE public.posts ADD COLUMN moderation_status moderation_status DEFAULT 'approved';
ALTER TABLE public.posts ADD COLUMN moderated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.posts ADD COLUMN moderated_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index for moderated posts
CREATE INDEX idx_posts_moderation_status ON public.posts(moderation_status);
