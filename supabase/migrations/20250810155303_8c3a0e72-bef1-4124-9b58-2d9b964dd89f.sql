DO $$
BEGIN
  BEGIN
    ALTER POLICY "Users can update their own notifications"
    ON public.notifications
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));
  EXCEPTION WHEN undefined_object THEN
    -- If the policy doesn't exist, create it defensively
    BEGIN
      CREATE POLICY "Users can update their own notifications"
      ON public.notifications
      FOR UPDATE
      USING (user_id = (select auth.uid()))
      WITH CHECK (user_id = (select auth.uid()));
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END;

  BEGIN
    ALTER POLICY "Users can view their own notifications"
    ON public.notifications
    USING (user_id = (select auth.uid()));
  EXCEPTION WHEN undefined_object THEN
    -- Create a SELECT policy if missing
    BEGIN
      CREATE POLICY "Users can view their own notifications"
      ON public.notifications
      FOR SELECT
      USING (user_id = (select auth.uid()));
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END;
END$$;