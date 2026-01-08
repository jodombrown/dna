-- Create trigger to auto-generate QR tokens for new attendees
CREATE OR REPLACE FUNCTION set_attendee_qr_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_code_token IS NULL THEN
    NEW.qr_code_token := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS trg_set_attendee_qr_token ON event_attendees;

-- Create trigger
CREATE TRIGGER trg_set_attendee_qr_token
  BEFORE INSERT ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION set_attendee_qr_token();

-- Generate QR tokens for any existing attendees without one
UPDATE event_attendees 
SET qr_code_token = encode(gen_random_bytes(16), 'hex')
WHERE qr_code_token IS NULL;