
-- Fix second broken trigger function
CREATE OR REPLACE FUNCTION public.generate_attendee_qr_token()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.qr_code_token IS NULL THEN
    NEW.qr_code_token := gen_random_uuid()::text;
  END IF;
  RETURN NEW;
END;
$$;
