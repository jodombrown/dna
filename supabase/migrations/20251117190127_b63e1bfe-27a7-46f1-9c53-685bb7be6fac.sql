-- FEED v1.1 | Database Fixes & Enhancements

-- 1. Add view_count column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 2. Add cascade delete for feed posts when entities are deleted
-- When events are deleted, mark related posts as deleted
CREATE OR REPLACE FUNCTION delete_event_posts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET is_deleted = TRUE
  WHERE linked_entity_type = 'event' 
    AND linked_entity_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_event_posts
BEFORE DELETE ON events
FOR EACH ROW
EXECUTE FUNCTION delete_event_posts();

-- When spaces are deleted, mark related posts as deleted  
CREATE OR REPLACE FUNCTION delete_space_posts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET is_deleted = TRUE
  WHERE linked_entity_type = 'space' 
    AND linked_entity_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_space_posts
BEFORE DELETE ON collaboration_spaces
FOR EACH ROW
EXECUTE FUNCTION delete_space_posts();

-- When contribution needs are deleted, mark related posts as deleted
CREATE OR REPLACE FUNCTION delete_need_posts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET is_deleted = TRUE
  WHERE linked_entity_type = 'need' 
    AND linked_entity_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_need_posts
BEFORE DELETE ON contribution_needs
FOR EACH ROW
EXECUTE FUNCTION delete_need_posts();

-- When community posts are deleted, mark feed posts as deleted
CREATE OR REPLACE FUNCTION delete_community_feed_posts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET is_deleted = TRUE
  WHERE linked_entity_type = 'community_post' 
    AND linked_entity_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_community_feed_posts
BEFORE DELETE ON community_posts
FOR EACH ROW
EXECUTE FUNCTION delete_community_feed_posts();