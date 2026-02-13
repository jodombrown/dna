
-- ============================================
-- 1. Fix mutable search_path on functions
-- ============================================

CREATE OR REPLACE FUNCTION public.update_space_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.spaces SET updated_at = now() WHERE id = NEW.space_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_creator_as_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.space_members (space_id, user_id, role, status)
  VALUES (NEW.id, NEW.created_by, 'lead', 'active')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_check_in_by_token(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attendee record;
  v_event record;
BEGIN
  SELECT * INTO v_attendee FROM public.event_attendees WHERE qr_token = p_token;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid token');
  END IF;
  IF v_attendee.checked_in THEN
    RETURN json_build_object('success', false, 'error', 'Already checked in');
  END IF;
  UPDATE public.event_attendees SET checked_in = true, check_in_time = now() WHERE id = v_attendee.id;
  SELECT title INTO v_event FROM public.events WHERE id = v_attendee.event_id;
  RETURN json_build_object('success', true, 'attendee_id', v_attendee.id, 'event_title', v_event.title);
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_attendee_qr_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.qr_token IS NULL THEN
    NEW.qr_token := encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_attendee_qr_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.qr_token IS NULL OR NEW.qr_token = '' THEN
    NEW.qr_token := encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_last_view_state_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================
-- 2. Tighten overly permissive RLS policies
-- ============================================

-- adin_nudges: system/service-role inserts only
DROP POLICY IF EXISTS "System can insert nudges" ON public.adin_nudges;
CREATE POLICY "System can insert nudges" ON public.adin_nudges
  FOR INSERT TO service_role WITH CHECK (true);

-- beta_waitlist: public sign-up is intentional, restrict to anon+authenticated
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.beta_waitlist;
CREATE POLICY "Anyone can join waitlist" ON public.beta_waitlist
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- conversations_new: only authenticated users
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations_new;
CREATE POLICY "Users can create conversations" ON public.conversations_new
  FOR INSERT TO authenticated WITH CHECK (true);

-- dia_queries: cache inserts by authenticated users
DROP POLICY IF EXISTS "dia_queries_insert_policy" ON public.dia_queries;
CREATE POLICY "dia_queries_insert_policy" ON public.dia_queries
  FOR INSERT TO authenticated WITH CHECK (true);

-- error_logs: service role only
DROP POLICY IF EXISTS "System can insert error logs" ON public.error_logs;
CREATE POLICY "System can insert error logs" ON public.error_logs
  FOR INSERT TO service_role WITH CHECK (true);

-- event_analytics: service role only
DROP POLICY IF EXISTS "System can insert analytics" ON public.event_analytics;
CREATE POLICY "System can insert analytics" ON public.event_analytics
  FOR INSERT TO service_role WITH CHECK (true);

-- events_log: service role only
DROP POLICY IF EXISTS "System can insert events" ON public.events_log;
CREATE POLICY "System can insert events" ON public.events_log
  FOR INSERT TO service_role WITH CHECK (true);

-- impact_log: service role only
DROP POLICY IF EXISTS "System can create impact logs" ON public.impact_log;
CREATE POLICY "System can create impact logs" ON public.impact_log
  FOR INSERT TO service_role WITH CHECK (true);

-- invites: service role only for updates
DROP POLICY IF EXISTS "System can update invite usage" ON public.invites;
CREATE POLICY "System can update invite usage" ON public.invites
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- newsletter_subscriptions: public subscribe is intentional
DROP POLICY IF EXISTS "Users can create newsletter subscriptions" ON public.newsletter_subscriptions;
CREATE POLICY "Users can create newsletter subscriptions" ON public.newsletter_subscriptions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- notifications: authenticated users can receive notifications
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT TO authenticated, service_role WITH CHECK (true);

-- profile_views: authenticated users log views
DROP POLICY IF EXISTS "profile_views_insert" ON public.profile_views;
CREATE POLICY "profile_views_insert" ON public.profile_views
  FOR INSERT TO authenticated WITH CHECK (true);

-- skill_analytics: service role only
DROP POLICY IF EXISTS "System can insert skill analytics" ON public.skill_analytics;
CREATE POLICY "System can insert skill analytics" ON public.skill_analytics
  FOR INSERT TO service_role WITH CHECK (true);

-- space_activity_log: service role only
DROP POLICY IF EXISTS "System can insert activity" ON public.space_activity_log;
CREATE POLICY "System can insert activity" ON public.space_activity_log
  FOR INSERT TO service_role WITH CHECK (true);

-- user_dna_points: service role only
DROP POLICY IF EXISTS "System can insert DNA points" ON public.user_dna_points;
CREATE POLICY "System can insert DNA points" ON public.user_dna_points
  FOR INSERT TO service_role WITH CHECK (true);

-- user_engagement_tracking: service role only
DROP POLICY IF EXISTS "System can create engagement events" ON public.user_engagement_tracking;
CREATE POLICY "System can create engagement events" ON public.user_engagement_tracking
  FOR INSERT TO service_role WITH CHECK (true);

-- user_recommendations: service role only
DROP POLICY IF EXISTS "System can create recommendations" ON public.user_recommendations;
CREATE POLICY "System can create recommendations" ON public.user_recommendations
  FOR INSERT TO service_role WITH CHECK (true);

-- waitlist_signups: public sign-up is intentional
DROP POLICY IF EXISTS "System can insert waitlist signups" ON public.waitlist_signups;
CREATE POLICY "Anyone can insert waitlist signups" ON public.waitlist_signups
  FOR INSERT TO anon, authenticated WITH CHECK (true);
