-- Delete all profiles except the specified admin emails
DELETE FROM public.profiles 
WHERE email NOT IN ('aweh@diasporanetwork.africa', 'Jaunelamarro@icloud.com');

-- Clean up any orphaned data that might reference deleted profiles
DELETE FROM public.contact_requests 
WHERE sender_id NOT IN (SELECT id FROM public.profiles) 
   OR receiver_id NOT IN (SELECT id FROM public.profiles);

DELETE FROM public.posts 
WHERE author_id NOT IN (SELECT id FROM public.profiles);

DELETE FROM public.comments 
WHERE author_id NOT IN (SELECT id FROM public.profiles);

DELETE FROM public.events 
WHERE created_by NOT IN (SELECT id FROM public.profiles);

DELETE FROM public.impact_log 
WHERE user_id NOT IN (SELECT id FROM public.profiles);