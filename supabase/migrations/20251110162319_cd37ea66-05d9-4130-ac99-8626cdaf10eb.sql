-- Fix security definer view warning by dropping it (not needed for user-facing queries)
DROP VIEW IF EXISTS public.user_auth_status;