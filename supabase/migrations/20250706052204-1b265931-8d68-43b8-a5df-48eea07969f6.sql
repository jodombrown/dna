-- Fix security definer issue with user_impact_summary view
-- Drop the existing view and recreate it without SECURITY DEFINER
DROP VIEW IF EXISTS public.user_impact_summary;

-- Create view for user impact summaries (without SECURITY DEFINER)
-- This view will respect RLS policies of the underlying tables
CREATE VIEW public.user_impact_summary AS
SELECT 
  user_id,
  COUNT(*) as total_actions,
  SUM(points) as total_points,
  COUNT(*) FILTER (WHERE type = 'post') as posts_created,
  COUNT(*) FILTER (WHERE type = 'comment') as comments_made,
  COUNT(*) FILTER (WHERE type = 'reaction') as reactions_given,
  COUNT(*) FILTER (WHERE type = 'connection') as connections_made,
  COUNT(*) FILTER (WHERE pillar = 'connect') as connect_actions,
  COUNT(*) FILTER (WHERE pillar = 'collaborate') as collaborate_actions,
  COUNT(*) FILTER (WHERE pillar = 'contribute') as contribute_actions,
  MAX(created_at) as last_activity
FROM public.impact_log
GROUP BY user_id;

-- Enable RLS on the view to ensure proper access control
ALTER VIEW public.user_impact_summary SET (security_invoker = on);