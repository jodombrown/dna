-- Create error_logs table for centralized error tracking
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_stack TEXT,
  url TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on error_logs table
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for error_logs table
CREATE POLICY "System can create error logs" ON public.error_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all error logs" ON public.error_logs
  FOR SELECT USING (is_admin_user(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_error_logs_error_type ON public.error_logs(error_type);