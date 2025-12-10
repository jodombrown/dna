-- =====================================================
-- Create a SECURITY DEFINER function to create conversations
-- This allows adding BOTH participants (not just self)
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_conversation_with_participant(
  p_other_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id uuid;
  v_conversation_id uuid;
  v_existing_conversation_id uuid;
BEGIN
  -- Get current user
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF v_current_user_id = p_other_user_id THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;
  
  -- Check if conversation already exists between these two users
  SELECT cp1.conversation_id INTO v_existing_conversation_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = v_current_user_id
    AND cp2.user_id = p_other_user_id
  LIMIT 1;
  
  IF v_existing_conversation_id IS NOT NULL THEN
    RETURN v_existing_conversation_id;
  END IF;
  
  -- Create new conversation
  INSERT INTO conversations_new (created_at, updated_at, last_message_at)
  VALUES (now(), now(), now())
  RETURNING id INTO v_conversation_id;
  
  -- Add both participants
  INSERT INTO conversation_participants (conversation_id, user_id, joined_at, last_read_at)
  VALUES 
    (v_conversation_id, v_current_user_id, now(), now()),
    (v_conversation_id, p_other_user_id, now(), now());
  
  RETURN v_conversation_id;
END;
$$;