
-- Create analytics_events table for tracking system events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  properties JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_metrics table for storing calculated metrics
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('count', 'percentage', 'average', 'sum')),
  time_period TEXT NOT NULL CHECK (time_period IN ('daily', 'weekly', 'monthly', 'yearly')),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Create admin_reports table for saved reports
CREATE TABLE IF NOT EXISTS public.admin_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  report_config JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  is_scheduled BOOLEAN DEFAULT false,
  schedule_config JSONB,
  last_generated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (admin only access)
CREATE POLICY "Admins can manage analytics events" 
  ON public.analytics_events 
  FOR ALL 
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can manage system metrics" 
  ON public.system_metrics 
  FOR ALL 
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can manage reports" 
  ON public.admin_reports 
  FOR ALL 
  USING (public.is_admin_user(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON public.system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON public.system_metrics(recorded_at);

-- Create function to get platform statistics
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'total_profiles', (SELECT COUNT(*) FROM public.profiles),
    'total_posts', (SELECT COUNT(*) FROM public.posts),
    'total_communities', (SELECT COUNT(*) FROM public.communities),
    'total_events', (SELECT COUNT(*) FROM public.events),
    'pending_communities', (SELECT COUNT(*) FROM public.communities WHERE moderation_status = 'pending'),
    'pending_flags', (SELECT COUNT(*) FROM public.content_flags WHERE status = 'pending'),
    'active_users_last_7_days', (
      SELECT COUNT(DISTINCT user_id) 
      FROM public.posts 
      WHERE created_at > now() - interval '7 days'
    ),
    'posts_last_30_days', (
      SELECT COUNT(*) 
      FROM public.posts 
      WHERE created_at > now() - interval '30 days'
    ),
    'events_next_30_days', (
      SELECT COUNT(*) 
      FROM public.events 
      WHERE date_time > now() AND date_time < now() + interval '30 days'
    )
  );
$$;
