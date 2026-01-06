-- Fix function search_path security warning
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket_number TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_ticket_number := 'DNA-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
    SELECT EXISTS(
      SELECT 1 FROM public.event_attendees WHERE qr_code_token = v_ticket_number
    ) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_ticket_number;
END;
$$;