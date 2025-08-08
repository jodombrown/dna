-- Fix failing view: remove non-existent column target_title
CREATE OR REPLACE VIEW public.view_public_contributions AS
SELECT 
  uc.user_id,
  uc.type,
  uc.target_id,
  uc.created_at
FROM public.user_contributions uc
JOIN public.user_adin_profile uap ON uap.user_id = uc.user_id
WHERE COALESCE(uap.is_verified_contributor, false) = true;

GRANT SELECT ON public.view_public_contributions TO anon, authenticated;
