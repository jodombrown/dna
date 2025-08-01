-- Fix duplicate index issue by dropping the auto-generated one
DROP INDEX IF EXISTS profiles_username_key;