
-- Fix security warning by setting immutable search path for get_platform_stats function
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
SET search_path = 'public'
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
