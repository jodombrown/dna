-- Fix security: ensure view runs with invoker privileges, not definer
ALTER VIEW public.view_public_contributions SET (security_invoker = true);