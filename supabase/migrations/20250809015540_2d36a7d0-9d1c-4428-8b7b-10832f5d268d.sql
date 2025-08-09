-- Fix internal errors by making policy/trigger creation idempotent and Postgres-compatible
-- Root cause: CREATE POLICY does not support IF NOT EXISTS; wrap in DO blocks using pg_policies/pg_trigger checks

-- 1) Ensure RLS is enabled on collaboration_spaces
ALTER TABLE public.collaboration_spaces ENABLE ROW LEVEL SECURITY;

-- 2) Policies (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'collaboration_spaces' 
      AND polname = 'Users can create their own spaces'
  ) THEN
    CREATE POLICY "Users can create their own spaces"
    ON public.collaboration_spaces
    FOR INSERT
    WITH CHECK (created_by = auth.uid());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'collaboration_spaces' 
      AND polname = 'Public can view public spaces or members can view'
  ) THEN
    CREATE POLICY "Public can view public spaces or members can view"
    ON public.collaboration_spaces
    FOR SELECT
    USING (
      (visibility = 'public') OR EXISTS (
        SELECT 1
        FROM public.collaboration_memberships m
        WHERE m.space_id = collaboration_spaces.id
          AND m.user_id = auth.uid()
          AND m.status = 'approved'
      )
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'collaboration_spaces' 
      AND polname = 'Owners/admins can update spaces'
  ) THEN
    CREATE POLICY "Owners/admins can update spaces"
    ON public.collaboration_spaces
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = collaboration_spaces.id
          AND m.user_id = auth.uid()
          AND m.role IN ('owner','admin')
          AND m.status = 'approved'
      )
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'collaboration_spaces' 
      AND polname = 'Owners/admins can delete spaces'
  ) THEN
    CREATE POLICY "Owners/admins can delete spaces"
    ON public.collaboration_spaces
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = collaboration_spaces.id
          AND m.user_id = auth.uid()
          AND m.role IN ('owner','admin')
          AND m.status = 'approved'
      )
    );
  END IF;
END$$;

-- 3) Triggers (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_create_collab_owner_membership'
  ) THEN
    CREATE TRIGGER trg_create_collab_owner_membership
    AFTER INSERT ON public.collaboration_spaces
    FOR EACH ROW
    EXECUTE FUNCTION public.create_collab_owner_membership();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_collaboration_spaces_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_collaboration_spaces_updated_at
    BEFORE UPDATE ON public.collaboration_spaces
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;