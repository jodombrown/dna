-- Fix duplicate profile insert during magic link sign-in by consolidating auth.users triggers
-- This addresses: duplicate key value violates unique constraint "profiles_pkey" seen on /otp

BEGIN;

-- Drop any existing triggers on auth.users that attempt to create/update profiles
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT t.tgname
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_proc p ON p.oid = t.tgfoid
    JOIN pg_namespace pn ON pn.oid = p.pronamespace
    WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND pn.nspname = 'public'
      AND p.proname IN ('handle_new_user','handle_admin_user_creation','auto_create_admin_user')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users;', r.tgname);
  END LOOP;
END$$;

-- Recreate a single canonical trigger that safely upserts the profile and admin record
CREATE TRIGGER dna_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_create_admin_user();

COMMIT;