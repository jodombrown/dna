-- Update the username function with proper duplicate checking
CREATE OR REPLACE FUNCTION public.update_username(new_username text)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_count integer;
  current_changes integer;
BEGIN
  -- Check if username already exists (case insensitive)
  SELECT count(*) INTO existing_count
  FROM profiles
  WHERE lower(username) = lower(new_username)
    AND id != auth.uid();

  IF existing_count > 0 THEN
    RAISE EXCEPTION 'Username already taken';
  END IF;

  -- Check if user has changes left
  SELECT username_changes_left INTO current_changes 
  FROM profiles 
  WHERE id = auth.uid();

  IF current_changes <= 0 THEN
    RAISE EXCEPTION 'Username can no longer be changed';
  END IF;

  -- Update username and decrement counter
  UPDATE profiles
  SET username = new_username,
      username_changes_left = username_changes_left - 1
  WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found or no changes remaining';
  END IF;
END;
$$;