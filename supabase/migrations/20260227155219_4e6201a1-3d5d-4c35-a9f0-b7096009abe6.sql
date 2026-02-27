
-- Fix broken trigger: references 'qr_token' but column is 'qr_code_token'
CREATE OR REPLACE FUNCTION public.set_attendee_qr_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_code_token IS NULL OR NEW.qr_code_token = '' THEN
    NEW.qr_code_token := gen_random_uuid()::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
