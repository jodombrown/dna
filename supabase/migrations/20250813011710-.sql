-- Fix linter warning 0011: Function Search Path Mutable for public.normalize_username_trg
ALTER FUNCTION public.normalize_username_trg()
  SET search_path TO 'public';