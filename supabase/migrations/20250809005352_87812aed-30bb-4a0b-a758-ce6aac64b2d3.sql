-- Grant execute privileges for RPCs to anon and authenticated roles
-- Ensure roles can use the public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant execute on all existing functions in public
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Ensure future functions also inherit execute privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;