-- Fix security warnings by adding proper search path to functions

-- Fix log_profile_view function
CREATE OR REPLACE FUNCTION public.log_profile_view(
  p_profile_id UUID,
  p_view_type TEXT DEFAULT 'profile_page'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_viewer_id UUID := auth.uid();
BEGIN
  IF v_viewer_id IS NULL OR v_viewer_id = p_profile_id THEN
    RETURN; -- Don't log self-views or anonymous views
  END IF;
  
  INSERT INTO public.profile_views (viewer_id, profile_id, view_type)
  VALUES (v_viewer_id, p_profile_id, p_view_type)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Fix log_post_event function
CREATE OR REPLACE FUNCTION public.log_post_event(
  p_post_id UUID,
  p_event_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;
  
  INSERT INTO public.post_analytics (post_id, event_type, user_id, metadata)
  VALUES (p_post_id, p_event_type, v_user_id, p_metadata)
  ON CONFLICT (post_id, event_type, user_id, event_date) 
  DO UPDATE SET 
    count = post_analytics.count + 1,
    metadata = p_metadata;
END;
$$;