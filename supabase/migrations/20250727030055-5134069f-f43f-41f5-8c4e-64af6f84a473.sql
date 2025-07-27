-- Fix security warnings: Set immutable search_path for database functions
-- This prevents potential SQL injection attacks by securing the search path

-- Fix track_post_engagement function
CREATE OR REPLACE FUNCTION public.track_post_engagement()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Track post creation
  IF TG_TABLE_NAME = 'posts' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.impact_log (user_id, type, target_type, target_id, pillar, points)
    VALUES (COALESCE(NEW.user_id, NEW.author_id), 'post', 'post', NEW.id, NEW.pillar, 10);
    RETURN NEW;
  END IF;
  
  -- Track likes
  IF TG_TABLE_NAME = 'post_likes' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.impact_log (user_id, type, target_type, target_id, pillar, points)
    VALUES (NEW.user_id, 'reaction', 'post', NEW.post_id, 'connect', 1);
    RETURN NEW;
  END IF;
  
  -- Track comments
  IF TG_TABLE_NAME = 'post_comments' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.impact_log (user_id, type, target_type, target_id, pillar, points)
    VALUES (NEW.user_id, 'comment', 'post', NEW.post_id, 'connect', 3);
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Fix track_post_reactions function
CREATE OR REPLACE FUNCTION public.track_post_reactions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Track reaction in impact log
    INSERT INTO public.impact_log (user_id, type, target_type, target_id, pillar, points)
    VALUES (NEW.user_id, 'reaction', 'post', NEW.post_id, 'connect', 1);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix track_comment_engagement function
CREATE OR REPLACE FUNCTION public.track_comment_engagement()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.impact_log (user_id, type, target_type, target_id, pillar, points)
    VALUES (NEW.user_id, 'comment', 'post', NEW.post_id, 'connect', 3);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;