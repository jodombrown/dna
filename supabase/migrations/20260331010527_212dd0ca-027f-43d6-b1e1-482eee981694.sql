CREATE OR REPLACE FUNCTION trg_auto_create_space_channel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_space_name text;
BEGIN
  v_space_name := NEW.name;

  BEGIN
    PERFORM create_space_messaging_channel(NEW.id, v_space_name || ' - Channel');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Auto-create space channel failed for space %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;