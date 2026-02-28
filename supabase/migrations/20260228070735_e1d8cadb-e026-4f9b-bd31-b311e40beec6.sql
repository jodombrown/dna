-- Remove orphaned event posts whose linked events were already deleted
DELETE FROM posts 
WHERE post_type = 'event' 
AND linked_entity_id IS NOT NULL 
AND linked_entity_id NOT IN (SELECT id FROM events);