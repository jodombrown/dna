
-- Add moderation fields to communities table
ALTER TABLE public.communities 
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'suspended')),
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS moderator_notes TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create community_flags table for flagged communities
CREATE TABLE IF NOT EXISTS public.community_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  flagged_by UUID REFERENCES auth.users(id),
  flag_type TEXT NOT NULL CHECK (flag_type IN ('inappropriate_content', 'spam', 'harassment', 'misinformation', 'copyright_violation', 'fake_community', 'other')),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  moderator_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on community_flags
ALTER TABLE public.community_flags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for community_flags (only admins can manage)
CREATE POLICY "Admins can manage community flags" 
  ON public.community_flags 
  FOR ALL 
  USING (public.is_admin_user(auth.uid()));

-- Update communities RLS policy to allow admins to see all communities including pending ones
DROP POLICY IF EXISTS "Communities viewable by everyone" ON public.communities;
CREATE POLICY "Communities viewable by everyone or admins" 
  ON public.communities 
  FOR SELECT 
  USING (
    moderation_status = 'approved' OR 
    public.is_admin_user(auth.uid())
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_communities_moderation_status ON public.communities(moderation_status);
CREATE INDEX IF NOT EXISTS idx_community_flags_status ON public.community_flags(status);
CREATE INDEX IF NOT EXISTS idx_community_flags_community_id ON public.community_flags(community_id);
