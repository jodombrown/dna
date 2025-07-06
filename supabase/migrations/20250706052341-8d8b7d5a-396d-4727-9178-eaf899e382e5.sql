-- Fix security warnings by setting immutable search paths for all functions

-- Update update_users_updated_at function
CREATE OR REPLACE FUNCTION public.update_users_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update update_posts_updated_at function
CREATE OR REPLACE FUNCTION public.update_posts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update update_comments_updated_at function
CREATE OR REPLACE FUNCTION public.update_comments_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update update_user_communities_updated_at function
CREATE OR REPLACE FUNCTION public.update_user_communities_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update calculate_impact_score function
CREATE OR REPLACE FUNCTION public.calculate_impact_score(target_user_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT COALESCE(SUM(
    CASE 
      WHEN type = 'post' THEN 10
      WHEN type = 'comment' THEN 3
      WHEN type = 'reaction' THEN 1
      WHEN type = 'connection' THEN 5
      WHEN type = 'project' THEN 20
      WHEN type = 'event' THEN 15
      WHEN type = 'community_join' THEN 8
      ELSE points
    END
  ), 0)::integer
  FROM public.impact_log 
  WHERE user_id = target_user_id;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update generate_referral_code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate a 8-character alphanumeric code
    new_code := upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$function$;