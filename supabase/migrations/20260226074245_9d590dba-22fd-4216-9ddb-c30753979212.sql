
-- Create the alpha_feedback table for the feedback form submissions
CREATE TABLE public.alpha_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  area TEXT,
  content TEXT NOT NULL,
  page_url TEXT,
  viewport TEXT,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alpha_feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can submit their own feedback"
ON public.alpha_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
ON public.alpha_feedback
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all feedback via user_roles table
CREATE POLICY "Admins can view all feedback"
ON public.alpha_feedback
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
);
