-- Create users table with role-based authentication structure
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('individual', 'organization', 'community')) NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  origin_country TEXT,
  diaspora_tags TEXT[], -- e.g. ['tech', 'education', 'policy']
  causes TEXT[],        -- e.g. ['climate', 'health', 'entrepreneurship']
  languages TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own record and public profiles" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id OR bio IS NOT NULL);

CREATE POLICY "Users can insert their own record" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own record" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_users_updated_at();

-- Create index for better performance on common queries
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_origin_country ON public.users(origin_country);
CREATE INDEX idx_users_diaspora_tags ON public.users USING GIN(diaspora_tags);
CREATE INDEX idx_users_causes ON public.users USING GIN(causes);