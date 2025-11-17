-- Clean up test posts for user 9ae5ecd9-f461-430a-9512-9bd8b90e3f33

DELETE FROM post_comments 
WHERE post_id IN (
  SELECT id FROM posts 
  WHERE author_id = '9ae5ecd9-f461-430a-9512-9bd8b90e3f33'
);

DELETE FROM post_likes 
WHERE post_id IN (
  SELECT id FROM posts 
  WHERE author_id = '9ae5ecd9-f461-430a-9512-9bd8b90e3f33'
);

DELETE FROM post_bookmarks 
WHERE post_id IN (
  SELECT id FROM posts 
  WHERE author_id = '9ae5ecd9-f461-430a-9512-9bd8b90e3f33'
);

DELETE FROM posts 
WHERE author_id = '9ae5ecd9-f461-430a-9512-9bd8b90e3f33';