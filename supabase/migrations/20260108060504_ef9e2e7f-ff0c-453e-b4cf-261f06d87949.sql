-- Create a trigger function to automatically create feed posts for new events
CREATE OR REPLACE FUNCTION public.create_event_feed_post()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create feed post for public, non-cancelled events
  IF NEW.is_public = true AND NEW.is_cancelled = false THEN
    INSERT INTO public.posts (
      author_id,
      post_type,
      content,
      linked_entity_type,
      linked_entity_id,
      event_id,
      space_id,
      image_url,
      privacy_level
    ) VALUES (
      NEW.organizer_id,
      'event',
      'Created an event: ' || NEW.title,
      'event',
      NEW.id,
      NEW.id,
      NEW.space_id,
      NEW.cover_image_url,
      'public'
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger on the events table
DROP TRIGGER IF EXISTS trg_create_event_feed_post ON public.events;
CREATE TRIGGER trg_create_event_feed_post
  AFTER INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.create_event_feed_post();

-- Add comment for documentation
COMMENT ON FUNCTION public.create_event_feed_post() IS 
'Automatically creates a feed post when a new event is inserted. Ensures events appear in the universal feed regardless of how they were created (UI, edge function, or direct DB insert).';

-- Also create feed post for the existing event that was seeded without one
INSERT INTO public.posts (
  author_id,
  post_type,
  content,
  linked_entity_type,
  linked_entity_id,
  event_id,
  image_url,
  privacy_level,
  created_at
)
SELECT 
  e.organizer_id,
  'event',
  'Created an event: ' || e.title,
  'event',
  e.id,
  e.id,
  e.cover_image_url,
  'public',
  e.created_at
FROM public.events e
LEFT JOIN public.posts p ON p.linked_entity_id = e.id AND p.linked_entity_type = 'event'
WHERE e.is_public = true 
  AND e.is_cancelled = false
  AND p.id IS NULL;