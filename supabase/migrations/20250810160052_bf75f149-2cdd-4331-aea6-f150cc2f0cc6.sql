-- Ensure realtime and counters: attach triggers for event registrations if missing
DO $$
BEGIN
  -- After INSERT/UPDATE/DELETE update attendee_count via _on_event_reg_change
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relname='event_registrations' AND t.tgname='after_event_reg_insert_update_count'
  ) THEN
    CREATE TRIGGER after_event_reg_insert_update_count
    AFTER INSERT OR UPDATE OR DELETE ON public.event_registrations
    FOR EACH ROW EXECUTE FUNCTION public._on_event_reg_change();
  END IF;

  -- After DELETE promote from waitlist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relname='event_registrations' AND t.tgname='after_event_reg_delete_promote'
  ) THEN
    CREATE TRIGGER after_event_reg_delete_promote
    AFTER DELETE ON public.event_registrations
    FOR EACH ROW EXECUTE FUNCTION public.trg_event_reg_cancel_promote();
  END IF;
END$$;