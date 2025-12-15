-- Migration: Add test account fields for seeded profiles
-- Purpose: Support auto-connect functionality and test account identification
-- Date: 2024-12-15
--
-- NON-PRODUCTION SAFEGUARDS:
-- - is_test_account defaults to FALSE
-- - auto_connect_enabled defaults to FALSE
-- - Only test accounts can use auto-connect functionality

-- Add is_test_account column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'is_test_account'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN is_test_account BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add auto_connect_enabled column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'auto_connect_enabled'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN auto_connect_enabled BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add index for test account queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_test_account
ON public.profiles(is_test_account)
WHERE is_test_account = TRUE;

-- Add index for seeded profiles
CREATE INDEX IF NOT EXISTS idx_profiles_is_seeded
ON public.profiles(is_seeded)
WHERE is_seeded = TRUE;

-- Add index for auto_connect queries
CREATE INDEX IF NOT EXISTS idx_profiles_auto_connect
ON public.profiles(auto_connect_enabled)
WHERE auto_connect_enabled = TRUE;

-- Update existing seeded profiles to have is_test_account and auto_connect_enabled
UPDATE public.profiles
SET
  is_test_account = TRUE,
  auto_connect_enabled = TRUE
WHERE is_seeded = TRUE;

-- Create function to check if both profiles are test accounts
CREATE OR REPLACE FUNCTION public.are_both_test_accounts(
  profile_id_1 UUID,
  profile_id_2 UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_test_1 BOOLEAN;
  is_test_2 BOOLEAN;
BEGIN
  SELECT (is_test_account = TRUE OR is_seeded = TRUE OR auto_connect_enabled = TRUE)
  INTO is_test_1
  FROM public.profiles
  WHERE id = profile_id_1;

  SELECT (is_test_account = TRUE OR is_seeded = TRUE OR auto_connect_enabled = TRUE)
  INTO is_test_2
  FROM public.profiles
  WHERE id = profile_id_2;

  RETURN COALESCE(is_test_1, FALSE) AND COALESCE(is_test_2, FALSE);
END;
$$;

-- Create function for auto-connect between test accounts
CREATE OR REPLACE FUNCTION public.auto_connect_test_accounts(
  p_requester_id UUID,
  p_recipient_id UUID,
  p_message TEXT DEFAULT '[Test Account Auto-Connect]'
)
RETURNS TABLE (
  success BOOLEAN,
  connection_id UUID,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_connection_id UUID;
  v_both_test BOOLEAN;
  v_existing_id UUID;
  v_existing_status TEXT;
BEGIN
  -- Check if both are test accounts
  SELECT public.are_both_test_accounts(p_requester_id, p_recipient_id) INTO v_both_test;

  IF NOT v_both_test THEN
    RETURN QUERY SELECT
      FALSE::BOOLEAN,
      NULL::UUID,
      'Auto-connect only available between test accounts'::TEXT;
    RETURN;
  END IF;

  -- Check for self-connection
  IF p_requester_id = p_recipient_id THEN
    RETURN QUERY SELECT
      FALSE::BOOLEAN,
      NULL::UUID,
      'Cannot connect to self'::TEXT;
    RETURN;
  END IF;

  -- Check for existing connection
  SELECT id, status INTO v_existing_id, v_existing_status
  FROM public.connections
  WHERE (requester_id = p_requester_id AND recipient_id = p_recipient_id)
     OR (requester_id = p_recipient_id AND recipient_id = p_requester_id)
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    IF v_existing_status = 'accepted' THEN
      RETURN QUERY SELECT
        TRUE::BOOLEAN,
        v_existing_id,
        'Connection already exists'::TEXT;
      RETURN;
    END IF;

    -- Update existing to accepted
    UPDATE public.connections
    SET status = 'accepted', updated_at = NOW()
    WHERE id = v_existing_id
    RETURNING id INTO v_connection_id;

    RETURN QUERY SELECT TRUE::BOOLEAN, v_connection_id, NULL::TEXT;
    RETURN;
  END IF;

  -- Create new auto-accepted connection
  INSERT INTO public.connections (requester_id, recipient_id, status, message)
  VALUES (p_requester_id, p_recipient_id, 'accepted', p_message)
  RETURNING id INTO v_connection_id;

  RETURN QUERY SELECT TRUE::BOOLEAN, v_connection_id, NULL::TEXT;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.are_both_test_accounts(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_connect_test_accounts(UUID, UUID, TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.is_test_account IS 'Indicates this is a test account for FoR testing only. NOT for production use.';
COMMENT ON COLUMN public.profiles.auto_connect_enabled IS 'Enables auto-accept connections between test accounts. Only works when both accounts have this enabled.';
COMMENT ON FUNCTION public.are_both_test_accounts IS 'Checks if both profiles are test accounts (seeded, test_account flag, or auto_connect enabled)';
COMMENT ON FUNCTION public.auto_connect_test_accounts IS 'Creates an auto-accepted connection between test accounts. Fails if either account is not a test account.';
