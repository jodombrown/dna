-- Fix search_path security warning
ALTER FUNCTION discover_members(uuid,text[],text[],text[],text,text,text[],text,text,integer,integer) 
SET search_path = public;