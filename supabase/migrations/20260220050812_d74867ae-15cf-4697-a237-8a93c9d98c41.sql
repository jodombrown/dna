
-- Fix: add search_path to the updated_at trigger function
CREATE OR REPLACE FUNCTION update_conversations_new_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
