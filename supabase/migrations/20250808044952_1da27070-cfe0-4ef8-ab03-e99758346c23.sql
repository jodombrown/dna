-- Notifications core schema
-- 1) Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('like','comment')),
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications (user_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_post ON public.notifications (post_id);

-- Prevent duplicate unread notifications of same type for same post
DO $$ BEGIN
  CREATE UNIQUE INDEX uniq_notifications_key ON public.notifications (user_id, actor_id, post_id, type) WHERE is_read = false;
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

-- 3) RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
CREATE POLICY "Users can read their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- System can create notifications (via triggers / security definer functions)
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Users can mark their own notifications as read
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- 4) Trigger functions
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT author_id INTO target_user FROM public.posts WHERE id = NEW.post_id;
    IF target_user IS NULL OR target_user = NEW.user_id THEN
      RETURN NEW;
    END IF;

    INSERT INTO public.notifications (user_id, actor_id, post_id, type)
    VALUES (target_user, NEW.user_id, NEW.post_id, 'like')
    ON CONFLICT (user_id, actor_id, post_id, type) DO NOTHING;

    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT author_id INTO target_user FROM public.posts WHERE id = NEW.post_id;
    IF target_user IS NULL OR target_user = NEW.user_id THEN
      RETURN NEW;
    END IF;

    INSERT INTO public.notifications (user_id, actor_id, post_id, type, metadata)
    VALUES (target_user, NEW.user_id, NEW.post_id, 'comment', jsonb_build_object('comment', COALESCE(NEW.comment, '')))
    ON CONFLICT (user_id, actor_id, post_id, type) DO NOTHING;

    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

-- 5) Triggers on post_likes and post_comments
DROP TRIGGER IF EXISTS trg_create_like_notification ON public.post_likes;
CREATE TRIGGER trg_create_like_notification
AFTER INSERT ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.create_like_notification();

-- Prefer post_comments table used by the app for feed comments
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'post_comments'
  ) THEN
    DROP TRIGGER IF EXISTS trg_create_comment_notification ON public.post_comments;
    CREATE TRIGGER trg_create_comment_notification
    AFTER INSERT ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION public.create_comment_notification();
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'comments'
  ) THEN
    DROP TRIGGER IF EXISTS trg_create_comment_notification ON public.comments;
    CREATE TRIGGER trg_create_comment_notification
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.create_comment_notification();
  END IF;
END $$;