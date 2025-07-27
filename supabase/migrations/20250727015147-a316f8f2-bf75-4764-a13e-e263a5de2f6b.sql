-- Add unique constraint to post_reactions to prevent duplicate reactions
-- This ensures one reaction per user per emoji per post
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_user_emoji_post'
  ) THEN
    ALTER TABLE public.post_reactions 
    ADD CONSTRAINT unique_user_emoji_post 
    UNIQUE (post_id, user_id, emoji);
  END IF;
END $$;

-- Track comment engagement in impact_log
CREATE OR REPLACE FUNCTION public.track_comment_engagement()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.impact_log (user_id, type, target_type, target_id, pillar, points)
    VALUES (NEW.user_id, 'comment', 'post', NEW.post_id, 'connect', 3);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'track_comment_engagement_trigger'
  ) THEN
    CREATE TRIGGER track_comment_engagement_trigger
      AFTER INSERT ON public.post_comments
      FOR EACH ROW
      EXECUTE FUNCTION public.track_comment_engagement();
  END IF;
END $$;