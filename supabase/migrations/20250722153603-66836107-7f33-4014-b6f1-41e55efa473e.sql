-- Fix function search path warnings by setting search_path for security

-- Update functions that don't have search_path set

-- Fix calculate_impact_score function
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

-- Fix get_current_user_profile function
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
 RETURNS TABLE(user_id uuid, is_public boolean)
 LANGUAGE sql
 SET search_path = 'public'
AS $function$
SELECT id, COALESCE((bio IS NOT NULL AND bio != ''), false) as is_public
FROM public.profiles 
WHERE id = auth.uid();
$function$;

-- Fix check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(_ip_address inet, _submission_type text, _max_submissions integer DEFAULT 5, _time_window_minutes integer DEFAULT 60)
 RETURNS boolean
 LANGUAGE sql
 SET search_path = 'public'
AS $function$
SELECT COUNT(*) < _max_submissions
FROM public.form_submissions
WHERE ip_address = _ip_address
  AND submission_type = _submission_type
  AND created_at > (now() - (_time_window_minutes || ' minutes')::interval);
$function$;