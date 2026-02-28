-- Remove curated event posts from feed
DELETE FROM posts WHERE post_type = 'event' AND linked_entity_id IN (
  SELECT id FROM events WHERE is_curated = true AND organizer_id = 'f2c1d415-254b-4881-99bc-988657ffc562'
);

-- Remove the curated events themselves
DELETE FROM events WHERE is_curated = true AND organizer_id = 'f2c1d415-254b-4881-99bc-988657ffc562';