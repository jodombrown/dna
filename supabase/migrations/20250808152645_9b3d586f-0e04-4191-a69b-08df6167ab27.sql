-- Feed Analytics & Insights: post views tracking
-- 1) Table: post_views
CREATE TABLE IF NOT EXISTS public.post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  viewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS post_views_unique_viewer ON public.post_views (post_id, viewer_id);
CREATE INDEX IF NOT EXISTS post_views_post_id_idx ON public.post_views (post_id);
CREATE INDEX IF NOT EXISTS post_views_post_time_idx ON public.post_views (post_id, viewed_at DESC);

-- RLS Policies
-- Users can insert their own view rows
CREATE POLICY "Users can insert their own post views"
ON public.post_views
FOR INSERT
WITH CHECK (viewer_id = auth.uid());

-- Authors (of the post), the viewer themselves, or admins can read
CREATE POLICY "Authors or viewers (or admins) can read post views"
ON public.post_views
FOR SELECT
USING (
  viewer_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = post_id AND p.author_id = auth.uid()
  )
  OR is_admin_user(auth.uid())
);

-- 2) Function: log_post_view
CREATE OR REPLACE FUNCTION public.log_post_view(p_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    -- Require authentication; anonymous users do nothing
    RETURN;
  END IF;

  -- Insert once per viewer per post; allow refresh if last view > 24h ago
  INSERT INTO public.post_views (post_id, viewer_id)
  VALUES (p_post_id, v_user)
  ON CONFLICT (post_id, viewer_id)
  DO UPDATE SET viewed_at = now()
  WHERE public.post_views.viewed_at < now() - interval '24 hours';
END;
$function$;