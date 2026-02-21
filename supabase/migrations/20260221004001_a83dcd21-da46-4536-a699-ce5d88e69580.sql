CREATE OR REPLACE FUNCTION public.get_thread_participant_count(p_conversation_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER 
  FROM conversation_participants 
  WHERE conversation_id = p_conversation_id;
$$;