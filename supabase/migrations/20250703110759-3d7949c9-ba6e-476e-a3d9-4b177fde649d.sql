
-- Create job_posts table
CREATE TABLE public.job_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  company TEXT NOT NULL,
  location TEXT,
  job_type TEXT DEFAULT 'full-time',
  salary_range TEXT,
  tags TEXT[] DEFAULT '{}',
  requirements TEXT,
  posted_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  application_url TEXT,
  application_email TEXT
);

-- Create job_referrals table
CREATE TABLE public.job_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users NOT NULL,
  referred_id UUID REFERENCES auth.users NOT NULL,
  job_id UUID REFERENCES public.job_posts NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending'
);

-- Enable RLS on job_posts
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for job_posts
CREATE POLICY "Job posts are viewable by everyone" 
  ON public.job_posts 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Authenticated users can create job posts" 
  ON public.job_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "Users can update their own job posts" 
  ON public.job_posts 
  FOR UPDATE 
  USING (auth.uid() = posted_by);

CREATE POLICY "Users can delete their own job posts" 
  ON public.job_posts 
  FOR DELETE 
  USING (auth.uid() = posted_by);

-- Enable RLS on job_referrals
ALTER TABLE public.job_referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for job_referrals
CREATE POLICY "Users can view referrals they made or received" 
  ON public.job_referrals 
  FOR SELECT 
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals" 
  ON public.job_referrals 
  FOR INSERT 
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update referrals they made" 
  ON public.job_referrals 
  FOR UPDATE 
  USING (auth.uid() = referrer_id);

-- Add indexes for better performance
CREATE INDEX idx_job_posts_tags ON public.job_posts USING GIN (tags);
CREATE INDEX idx_job_posts_location ON public.job_posts (location);
CREATE INDEX idx_job_posts_active ON public.job_posts (is_active);
CREATE INDEX idx_job_referrals_referrer ON public.job_referrals (referrer_id);
CREATE INDEX idx_job_referrals_referred ON public.job_referrals (referred_id);
CREATE INDEX idx_job_referrals_job ON public.job_referrals (job_id);
