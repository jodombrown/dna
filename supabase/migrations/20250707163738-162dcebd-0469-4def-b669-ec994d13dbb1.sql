-- Create growth-oriented tables for admin panel

-- Growth campaigns table
CREATE TABLE IF NOT EXISTS public.growth_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'email', -- email, notification, sms
  status TEXT NOT NULL DEFAULT 'draft', -- draft, scheduled, active, completed, paused
  target_segment JSONB DEFAULT '{}', -- filters for user targeting
  content JSONB DEFAULT '{}', -- email/notification content
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  metrics JSONB DEFAULT '{
    "sent": 0,
    "opened": 0,
    "clicked": 0,
    "converted": 0
  }'
);

-- Integration tokens table for secure API key storage
CREATE TABLE IF NOT EXISTS public.integration_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE, -- sendgrid, mailchimp, zapier, segment
  token_type TEXT NOT NULL DEFAULT 'api_key', -- api_key, webhook_url, oauth_token
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Campaign analytics table
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.growth_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL, -- sent, opened, clicked, converted
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.growth_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for growth_campaigns
CREATE POLICY "Admins can manage growth campaigns" 
  ON public.growth_campaigns 
  FOR ALL 
  USING (public.is_admin_user((select auth.uid())));

-- RLS policies for integration_tokens
CREATE POLICY "Superadmins can manage integration tokens" 
  ON public.integration_tokens 
  FOR ALL 
  USING (public.get_admin_role((select auth.uid())) = 'superadmin');

-- RLS policies for campaign_analytics
CREATE POLICY "Admins can view campaign analytics" 
  ON public.campaign_analytics 
  FOR SELECT 
  USING (public.is_admin_user((select auth.uid())));

CREATE POLICY "System can create campaign analytics" 
  ON public.campaign_analytics 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_growth_campaigns_status ON public.growth_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_growth_campaigns_created_by ON public.growth_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON public.campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_event_type ON public.campaign_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_service ON public.integration_tokens(service_name);

-- Create triggers for updated_at
CREATE TRIGGER update_growth_campaigns_updated_at
  BEFORE UPDATE ON public.growth_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integration_tokens_updated_at
  BEFORE UPDATE ON public.integration_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();