
-- Update the trigger to skip curated events (no feed posts for curated content)
CREATE OR REPLACE FUNCTION public.create_event_feed_post()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip curated events — they surface via DIA cards, not the social feed
  IF NEW.is_curated = true THEN
    RETURN NEW;
  END IF;

  -- Only create feed post for public, non-cancelled events
  IF NEW.is_public = true AND NEW.is_cancelled = false THEN
    INSERT INTO public.posts (
      author_id,
      post_type,
      content,
      linked_entity_type,
      linked_entity_id,
      event_id,
      image_url,
      privacy_level
    ) VALUES (
      NEW.organizer_id,
      'event',
      'Created an event: ' || NEW.title,
      'event',
      NEW.id,
      NEW.id,
      NEW.cover_image_url,
      'public'
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
