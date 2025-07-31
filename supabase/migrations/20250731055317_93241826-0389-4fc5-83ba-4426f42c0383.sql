-- Phase 9 Beta Launch Features Database Setup

-- 1. Invites System
CREATE TABLE public.invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(inviter_id, invitee_email)
);

-- 2. Event Registrations
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(user_id, event_id)
);

-- 3. Newsletter Subscriptions
CREATE TABLE public.newsletter_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  preferences JSONB DEFAULT '{"weekly_digest": true, "event_announcements": true, "feature_updates": true}',
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Beta Feedback (already exists but let's ensure it has the right structure)
CREATE TABLE IF NOT EXISTS public.beta_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'feature_request', 'improvement', 'general')),
  feedback_text TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Invites
CREATE POLICY "Users can view their sent invites" 
ON public.invites FOR SELECT 
USING (auth.uid() = inviter_id);

CREATE POLICY "Users can create invites" 
ON public.invites FOR INSERT 
WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update their own invites" 
ON public.invites FOR UPDATE 
USING (auth.uid() = inviter_id);

-- RLS Policies for Event Registrations
CREATE POLICY "Users can view their own registrations" 
ON public.event_registrations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations" 
ON public.event_registrations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" 
ON public.event_registrations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own registrations" 
ON public.event_registrations FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for Newsletter Subscriptions
CREATE POLICY "Users can view their own newsletter subscription" 
ON public.newsletter_subscriptions FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Anyone can create newsletter subscriptions" 
ON public.newsletter_subscriptions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own newsletter subscription" 
ON public.newsletter_subscriptions FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- RLS Policies for Beta Feedback
CREATE POLICY "Users can view their own feedback" 
ON public.beta_feedback FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback" 
ON public.beta_feedback FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" 
ON public.beta_feedback FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_invites_inviter_id ON public.invites(inviter_id);
CREATE INDEX idx_invites_token ON public.invites(token);
CREATE INDEX idx_invites_status ON public.invites(status);
CREATE INDEX idx_event_registrations_user_id ON public.event_registrations(user_id);
CREATE INDEX idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX idx_newsletter_email ON public.newsletter_subscriptions(email);
CREATE INDEX idx_beta_feedback_user_id ON public.beta_feedback(user_id);
CREATE INDEX idx_beta_feedback_type ON public.beta_feedback(feedback_type);

-- Add trigger for updated_at on newsletter subscriptions
CREATE TRIGGER update_newsletter_subscriptions_updated_at
  BEFORE UPDATE ON public.newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on beta feedback  
CREATE TRIGGER update_beta_feedback_updated_at
  BEFORE UPDATE ON public.beta_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();