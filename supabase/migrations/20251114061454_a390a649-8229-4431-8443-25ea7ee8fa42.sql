-- Create spaces table for COLLABORATE pillar
CREATE TABLE IF NOT EXISTS public.spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  space_type TEXT NOT NULL CHECK (space_type IN ('project', 'working_group', 'initiative', 'program')),
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'active', 'completed', 'paused')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'invite_only')),
  focus_areas TEXT[] DEFAULT '{}',
  region TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origin_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  origin_group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create space_members table
CREATE TABLE IF NOT EXISTS public.space_members (
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN ('lead', 'core_contributor', 'contributor')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (space_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_spaces_created_by ON public.spaces(created_by);
CREATE INDEX IF NOT EXISTS idx_spaces_visibility ON public.spaces(visibility);
CREATE INDEX IF NOT EXISTS idx_spaces_status ON public.spaces(status);
CREATE INDEX IF NOT EXISTS idx_spaces_slug ON public.spaces(slug);
CREATE INDEX IF NOT EXISTS idx_space_members_user_id ON public.space_members(user_id);
CREATE INDEX IF NOT EXISTS idx_space_members_space_id ON public.space_members(space_id);

-- Enable RLS
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for spaces
-- Select: authenticated users can view public spaces OR spaces they're members of
CREATE POLICY "Users can view public or member spaces"
ON public.spaces
FOR SELECT
TO authenticated
USING (
  visibility = 'public'
  OR EXISTS (
    SELECT 1 FROM public.space_members sm
    WHERE sm.space_id = spaces.id
    AND sm.user_id = (SELECT auth.uid())
  )
);

-- Insert: authenticated users can create spaces
CREATE POLICY "Authenticated users can create spaces"
ON public.spaces
FOR INSERT
TO authenticated
WITH CHECK (created_by = (SELECT auth.uid()));

-- Update: only creator can update
CREATE POLICY "Creators can update their spaces"
ON public.spaces
FOR UPDATE
TO authenticated
USING (created_by = (SELECT auth.uid()))
WITH CHECK (created_by = (SELECT auth.uid()));

-- Delete: only creator can delete
CREATE POLICY "Creators can delete their spaces"
ON public.spaces
FOR DELETE
TO authenticated
USING (created_by = (SELECT auth.uid()));

-- RLS Policies for space_members
-- Select: users can view their own memberships
CREATE POLICY "Users can view their own memberships"
ON public.space_members
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Insert: space leads can add members (for now, restrict to server/admin)
CREATE POLICY "Space leads can add members"
ON public.space_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.spaces s
    WHERE s.id = space_id
    AND (
      s.created_by = (SELECT auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.space_members sm
        WHERE sm.space_id = space_id
        AND sm.user_id = (SELECT auth.uid())
        AND sm.role = 'lead'
      )
    )
  )
  OR user_id = (SELECT auth.uid()) -- Users can join themselves
);

-- Update: space leads can update member roles
CREATE POLICY "Space leads can update member roles"
ON public.space_members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.spaces s
    WHERE s.id = space_id
    AND (
      s.created_by = (SELECT auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.space_members sm
        WHERE sm.space_id = space_id
        AND sm.user_id = (SELECT auth.uid())
        AND sm.role = 'lead'
      )
    )
  )
);

-- Delete: space leads can remove members, or users can remove themselves
CREATE POLICY "Space leads can remove members or users can leave"
ON public.space_members
FOR DELETE
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.spaces s
    WHERE s.id = space_id
    AND (
      s.created_by = (SELECT auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.space_members sm
        WHERE sm.space_id = space_id
        AND sm.user_id = (SELECT auth.uid())
        AND sm.role = 'lead'
      )
    )
  )
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_spaces_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER spaces_updated_at_trigger
BEFORE UPDATE ON public.spaces
FOR EACH ROW
EXECUTE FUNCTION update_spaces_updated_at();