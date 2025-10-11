-- Fix final auth RLS performance warnings by checking actual column names

-- First, let's check and fix search_preferences
-- Assuming it has a user_id column (common pattern)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'search_preferences' 
    AND column_name = 'user_id'
  ) THEN
    DROP POLICY IF EXISTS "Users can manage their search preferences" ON public.search_preferences;
    EXECUTE 'CREATE POLICY "Users can manage their search preferences" ON public.search_preferences
      FOR ALL USING (user_id = (SELECT auth.uid()))
      WITH CHECK (user_id = (SELECT auth.uid()))';
  END IF;
END $$;

-- Fix newsletter_subscriptions
-- Checking for common column patterns: user_id, profile_id, or email
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'newsletter_subscriptions' 
    AND column_name = 'email'
  ) THEN
    DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.newsletter_subscriptions;
    EXECUTE 'CREATE POLICY "Users can update their own subscriptions" ON public.newsletter_subscriptions
      FOR UPDATE USING (email = (SELECT auth.email()))';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'newsletter_subscriptions' 
    AND column_name = 'profile_id'
  ) THEN
    DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.newsletter_subscriptions;
    EXECUTE 'CREATE POLICY "Users can update their own subscriptions" ON public.newsletter_subscriptions
      FOR UPDATE USING (profile_id = (SELECT auth.uid()))';
  END IF;
END $$;