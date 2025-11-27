-- DNA | FEED v2.0 - RPC Overload Cleanup (cursor variant)
-- Drop legacy get_universal_feed overload that still uses p_post_type and p_cursor

DROP FUNCTION IF EXISTS public.get_universal_feed(
  p_viewer_id uuid,
  p_tab text,
  p_author_id uuid,
  p_space_id uuid,
  p_event_id uuid,
  p_post_type text,
  p_limit integer,
  p_offset integer,
  p_cursor timestamp with time zone,
  p_ranking_mode text
);
