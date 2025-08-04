-- Fix the check_badge_unlocks function to remove reference to non-existent opportunities table
CREATE OR REPLACE FUNCTION public.check_badge_unlocks(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_points RECORD;
  connection_count INTEGER;
  post_count INTEGER;
BEGIN
  -- Get user's current points
  SELECT * INTO user_points FROM public.user_dna_points WHERE user_id = target_user_id;
  
  IF user_points IS NULL THEN
    RETURN;
  END IF;

  -- Get additional stats for badge criteria
  SELECT COUNT(*) INTO connection_count FROM public.contact_requests 
  WHERE sender_id = target_user_id AND status = 'accepted';
  
  SELECT COUNT(*) INTO post_count FROM public.posts WHERE author_id = target_user_id;

  -- First Collab badge (first collaboration action)
  IF user_points.collaborate_score >= 1 THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, description, icon)
    VALUES (target_user_id, 'first_collab', 'First Collaboration', 'Completed your first collaboration', '🤝')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- 10 Connections badge
  IF connection_count >= 10 THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, description, icon)
    VALUES (target_user_id, '10_connections', 'Super Connector', 'Made 10 meaningful connections', '🌐')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- First Post badge (when user creates their first post)
  IF post_count >= 1 THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, description, icon)
    VALUES (target_user_id, 'first_post', 'First Post', 'Shared your first post with the community', '📝')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Community Builder badge (high connect score)
  IF user_points.connect_score >= 100 THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, description, icon)
    VALUES (target_user_id, 'community_builder', 'Community Builder', 'Built strong community connections', '🏗️')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Community Hero badge (total score > 1000 and verified contributor)
  IF user_points.total_score >= 1000 AND EXISTS(
    SELECT 1 FROM public.user_adin_profile 
    WHERE user_id = target_user_id AND is_verified_contributor = true
  ) THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, description, icon)
    VALUES (target_user_id, 'community_hero', 'Community Hero', 'Verified contributor with exceptional impact', '🏆')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
END;
$function$;