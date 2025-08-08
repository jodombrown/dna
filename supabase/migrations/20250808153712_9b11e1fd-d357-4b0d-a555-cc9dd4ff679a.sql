-- Notifications policies with existence guards
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON public.notifications (user_id, is_read, created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can read their own notifications' AND polrelid = 'public.notifications'::regclass
  ) THEN
    CREATE POLICY "Users can read their own notifications"
    ON public.notifications
    FOR SELECT
    USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can update their own notifications' AND polrelid = 'public.notifications'::regclass
  ) THEN
    CREATE POLICY "Users can update their own notifications"
    ON public.notifications
    FOR UPDATE
    USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'System can insert notifications' AND polrelid = 'public.notifications'::regclass
  ) THEN
    CREATE POLICY "System can insert notifications"
    ON public.notifications
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.send_notification(
  p_recipient_id uuid,
  p_type text,
  p_entity_type text,
  p_entity_id uuid,
  p_title text,
  p_body text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.notifications (
    user_id, type, title, body, related_entity_id, related_entity_type, is_read, created_at, updated_at
  ) VALUES (
    p_recipient_id, p_type, p_title, p_body, p_entity_id, p_entity_type, false, now(), now()
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;
$fn$;