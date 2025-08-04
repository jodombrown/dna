-- Fix the impact_log pillar constraint to include 'feed'
ALTER TABLE public.impact_log DROP CONSTRAINT IF EXISTS impact_log_pillar_check;

-- Add the corrected constraint that includes 'feed'
ALTER TABLE public.impact_log ADD CONSTRAINT impact_log_pillar_check 
CHECK (pillar IN ('connect', 'collaborate', 'contribute', 'feed'));

-- Enable realtime for posts table
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.posts;

-- Enable realtime for post_likes table  
ALTER TABLE public.post_likes REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.post_likes;

-- Enable realtime for post_comments table
ALTER TABLE public.post_comments REPLICA IDENTITY FULL; 
ALTER publication supabase_realtime ADD TABLE public.post_comments;