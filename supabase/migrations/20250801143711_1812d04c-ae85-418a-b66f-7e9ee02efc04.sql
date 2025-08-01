-- Fix duplicate index by removing the auto-generated constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key;