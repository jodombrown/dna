-- Fix search_path security warnings for Profile v2 update RPCs
-- Set search_path to 'public' for all update functions

ALTER FUNCTION update_profile_identity SET search_path = 'public';
ALTER FUNCTION update_profile_about SET search_path = 'public';
ALTER FUNCTION update_profile_diaspora SET search_path = 'public';
ALTER FUNCTION update_profile_skills SET search_path = 'public';
ALTER FUNCTION update_profile_contributions SET search_path = 'public';
ALTER FUNCTION update_profile_interests SET search_path = 'public';