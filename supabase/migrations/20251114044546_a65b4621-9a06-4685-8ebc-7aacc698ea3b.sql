-- Create event_reminder_logs table for tracking sent reminders
CREATE TABLE IF NOT EXISTS public.event_reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL DEFAULT 'event_24h',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notification_id UUID REFERENCES public.notifications(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate reminders for same event/user/type
  UNIQUE(event_id, user_id, reminder_type)
);

-- Enable RLS
ALTER TABLE public.event_reminder_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view all logs
CREATE POLICY "Admins can view all reminder logs"
  ON public.event_reminder_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND 'admin' = ANY(profiles.roles)
    )
  );

-- Users can view their own logs
CREATE POLICY "Users can view their own reminder logs"
  ON public.event_reminder_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_event_reminder_logs_event_id ON public.event_reminder_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reminder_logs_user_id ON public.event_reminder_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reminder_logs_sent_at ON public.event_reminder_logs(sent_at DESC);

-- Create cron_job_logs table for monitoring cron executions
CREATE TABLE IF NOT EXISTS public.cron_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'error')),
  events_processed INTEGER DEFAULT 0,
  reminders_sent INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view cron logs
CREATE POLICY "Admins can view cron logs"
  ON public.cron_job_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND 'admin' = ANY(profiles.roles)
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_job_name ON public.cron_job_logs(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_started_at ON public.cron_job_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_status ON public.cron_job_logs(status);