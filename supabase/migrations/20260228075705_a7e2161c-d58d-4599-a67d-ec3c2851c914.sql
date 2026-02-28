-- Nullify organizer_id on existing curated events
UPDATE public.events SET organizer_id = NULL WHERE is_curated = true;

-- Delete the dna-platform system profile
DELETE FROM public.profiles WHERE username = 'dna-platform' OR email = 'platform@diasporanetwork.africa';