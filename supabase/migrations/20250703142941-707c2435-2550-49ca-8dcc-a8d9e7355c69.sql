-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  contact_email TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verification_documents JSONB DEFAULT '[]'::jsonb,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  rejection_reason TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization_members table
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can create organizations" 
ON public.organizations 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own organizations" 
ON public.organizations 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Organizations viewable by everyone" 
ON public.organizations 
FOR SELECT 
USING (verification_status = 'approved');

CREATE POLICY "Admins can view all organizations" 
ON public.organizations 
FOR SELECT 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can update organizations" 
ON public.organizations 
FOR UPDATE 
USING (is_admin_user(auth.uid()));

-- Organization members policies
CREATE POLICY "Organization members viewable by org members" 
ON public.organization_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om 
    WHERE om.organization_id = organization_members.organization_id 
    AND om.user_id = auth.uid()
  )
);

CREATE POLICY "Organization admins can manage members" 
ON public.organization_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om 
    WHERE om.organization_id = organization_members.organization_id 
    AND om.user_id = auth.uid() 
    AND om.role = 'admin'
  )
);

-- Function to automatically add creator as organization admin
CREATE OR REPLACE FUNCTION public.create_organization_admin_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create admin membership
CREATE TRIGGER create_organization_admin_membership_trigger
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_organization_admin_membership();