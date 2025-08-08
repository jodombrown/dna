-- 1) Secure contribution logging RPC
CREATE OR REPLACE FUNCTION public.rpc_log_contribution(
  p_type text,
  p_target_id uuid,
  p_target_title text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_contributions (user_id, type, target_id, target_title, metadata, created_at)
  VALUES (auth.uid(), p_type, p_target_id, p_target_title, COALESCE(p_metadata, '{}'::jsonb), now());
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_log_contribution(text, uuid, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_log_contribution(text, uuid, text, jsonb) TO authenticated;

-- 2) Ensure/update timestamp function (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3) Triggers (guarded, idempotent)
DO $$ BEGIN
  IF to_regclass('public.collaboration_spaces') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_spaces_updated') THEN
      CREATE TRIGGER t_spaces_updated
      BEFORE UPDATE ON public.collaboration_spaces
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;

  IF to_regclass('public.tasks') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_tasks_updated') THEN
      CREATE TRIGGER t_tasks_updated
      BEFORE UPDATE ON public.tasks
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;

  IF to_regclass('public.milestones') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_ms_updated') THEN
      CREATE TRIGGER t_ms_updated
      BEFORE UPDATE ON public.milestones
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;

  IF to_regclass('public.opportunities') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_opps_updated') THEN
      CREATE TRIGGER t_opps_updated
      BEFORE UPDATE ON public.opportunities
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;
END $$;

-- 4) Helpful indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_tasks_space ON public.tasks(space_id);
CREATE INDEX IF NOT EXISTS idx_ms_space ON public.milestones(space_id);
CREATE INDEX IF NOT EXISTS idx_opps_created_at ON public.opportunities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opps_space ON public.opportunities(space_id);
