
-- Drop old functions with CASCADE
DROP FUNCTION IF EXISTS public.create_like_notification() CASCADE;
DROP FUNCTION IF EXISTS public.create_comment_notification() CASCADE;

-- Function to create notification for post likes
CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
BEGIN
  -- Get the post author
  SELECT author_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Don't notify if user likes their own post
  IF post_author_id IS NULL OR post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Create notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    related_user_id,
    related_entity_type,
    related_entity_id
  ) VALUES (
    post_author_id,
    'post_like',
    'New like on your post',
    'Someone liked your post',
    '/dna/feed',
    NEW.user_id,
    'post',
    NEW.post_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to create notification for post comments
CREATE OR REPLACE FUNCTION public.notify_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
BEGIN
  -- Get the post author
  SELECT author_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Don't notify if user comments on their own post
  IF post_author_id IS NULL OR post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Create notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    related_user_id,
    related_entity_type,
    related_entity_id
  ) VALUES (
    post_author_id,
    'post_comment',
    'New comment on your post',
    'Someone commented on your post',
    '/dna/feed',
    NEW.user_id,
    'post',
    NEW.post_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to create notification for new connections
CREATE OR REPLACE FUNCTION public.notify_new_connection()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify both users when a connection is created
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    related_user_id,
    related_entity_type,
    related_entity_id
  ) VALUES (
    NEW.user_id,
    'connection_accepted',
    'New connection',
    'You have a new connection',
    '/dna/network',
    NEW.connection_id,
    'connection',
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers
CREATE TRIGGER notify_post_like_trigger
  AFTER INSERT ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_like();

CREATE TRIGGER notify_post_comment_trigger
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_comment();

CREATE TRIGGER notify_new_connection_trigger
  AFTER INSERT ON public.user_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_connection();
