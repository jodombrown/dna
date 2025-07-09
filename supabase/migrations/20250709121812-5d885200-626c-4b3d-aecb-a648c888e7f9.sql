-- Create a custom function to handle message reactions
CREATE OR REPLACE FUNCTION public.add_message_reaction(
  p_message_id UUID,
  p_user_id UUID,
  p_reaction TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.message_reactions (message_id, user_id, reaction)
  VALUES (p_message_id, p_user_id, p_reaction)
  ON CONFLICT (message_id, user_id, reaction) DO NOTHING;
END;
$$;

-- Create a custom function to remove message reactions
CREATE OR REPLACE FUNCTION public.remove_message_reaction(
  p_message_id UUID,
  p_user_id UUID,
  p_reaction TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.message_reactions
  WHERE message_id = p_message_id 
    AND user_id = p_user_id 
    AND reaction = p_reaction;
END;
$$;

-- Create a custom function to get reactions for messages
CREATE OR REPLACE FUNCTION public.get_message_reactions(
  p_message_ids UUID[]
)
RETURNS TABLE (
  id UUID,
  message_id UUID,
  user_id UUID,
  reaction TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.message_id, r.user_id, r.reaction, r.created_at
  FROM public.message_reactions r
  WHERE r.message_id = ANY(p_message_ids);
END;
$$;