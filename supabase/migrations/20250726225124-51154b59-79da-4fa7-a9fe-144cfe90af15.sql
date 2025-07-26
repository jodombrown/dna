-- Update the posts pillar check constraint to include 'feed'
ALTER TABLE public.posts 
DROP CONSTRAINT posts_pillar_check;

ALTER TABLE public.posts 
ADD CONSTRAINT posts_pillar_check 
CHECK (pillar = ANY (ARRAY['connect'::text, 'collaborate'::text, 'contribute'::text, 'feed'::text]));