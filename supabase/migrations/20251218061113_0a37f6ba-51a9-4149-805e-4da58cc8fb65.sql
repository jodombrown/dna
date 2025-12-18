
-- Update get_user_notifications to handle different actor ID field names in payload
CREATE OR REPLACE FUNCTION public.get_user_notifications(
  p_user_id uuid, 
  p_unread_only boolean DEFAULT false, 
  p_limit integer DEFAULT 20, 
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  notification_id uuid, 
  actor_id uuid, 
  actor_username text, 
  actor_full_name text, 
  actor_avatar_url text, 
  type text, 
  title text, 
  message text, 
  action_url text, 
  entity_type text, 
  entity_id uuid, 
  is_read boolean, 
  created_at timestamp with time zone, 
  read_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    n.id AS notification_id,
    p.id AS actor_id,
    p.username AS actor_username,
    p.full_name AS actor_full_name,
    p.avatar_url AS actor_avatar_url,
    n.type,
    n.title,
    n.message,
    n.link_url AS action_url,
    COALESCE(n.payload->>'entity_type', 'notification')::TEXT AS entity_type,
    COALESCE(
      (n.payload->>'entity_id')::UUID,
      (n.payload->>'post_id')::UUID,
      n.id
    ) AS entity_id,
    n.is_read,
    n.created_at,
    CASE WHEN n.is_read THEN n.updated_at ELSE NULL END AS read_at
  FROM notifications n
  LEFT JOIN profiles p ON p.id = COALESCE(
    (n.payload->>'actor_id')::UUID,
    (n.payload->>'commenter_id')::UUID,
    (n.payload->>'sender_id')::UUID,
    (n.payload->>'from_user_id')::UUID,
    (n.payload->>'requester_id')::UUID
  )
  WHERE n.user_id = p_user_id
    AND (NOT p_unread_only OR n.is_read = false)
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;
