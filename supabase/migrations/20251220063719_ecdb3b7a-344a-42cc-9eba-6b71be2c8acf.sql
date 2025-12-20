-- Fix search_path security warning
ALTER FUNCTION discover_members(uuid, text[], text[], text[], text, text, text[], text, text, int, int)
SET search_path = public;