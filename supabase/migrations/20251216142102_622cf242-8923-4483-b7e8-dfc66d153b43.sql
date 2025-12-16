-- Delete user: jaunelamarro@icloud.com (9ae5ecd9-f461-430a-9512-9bd8b90e3f33)

DO $$
DECLARE
  target_user_id UUID := '9ae5ecd9-f461-430a-9512-9bd8b90e3f33';
BEGIN
  -- Delete post-related data first
  DELETE FROM post_comments WHERE post_id IN (SELECT id FROM posts WHERE author_id = target_user_id);
  DELETE FROM post_reactions WHERE post_id IN (SELECT id FROM posts WHERE author_id = target_user_id);
  DELETE FROM post_bookmarks WHERE post_id IN (SELECT id FROM posts WHERE author_id = target_user_id);
  
  -- Delete user's own reactions, bookmarks, comments
  DELETE FROM post_comments WHERE user_id = target_user_id;
  DELETE FROM post_reactions WHERE user_id = target_user_id;
  DELETE FROM post_bookmarks WHERE user_id = target_user_id;
  
  -- Delete user's posts
  DELETE FROM posts WHERE author_id = target_user_id;
  
  -- Delete messages in user's conversations
  DELETE FROM messages WHERE conversation_id IN (
    SELECT id FROM conversations WHERE user_a = target_user_id OR user_b = target_user_id
  );
  
  -- Delete conversations
  DELETE FROM conversations WHERE user_a = target_user_id OR user_b = target_user_id;
  
  -- Delete connections
  DELETE FROM connections WHERE requester_id = target_user_id OR recipient_id = target_user_id;
  
  -- Delete ADIN-related data
  DELETE FROM adin_nudges WHERE user_id = target_user_id;
  DELETE FROM adin_recommendations WHERE user_id = target_user_id;
  DELETE FROM adin_preferences WHERE user_id = target_user_id;
  DELETE FROM adin_signals WHERE user_id = target_user_id;
  
  -- Delete notifications
  DELETE FROM notifications WHERE user_id = target_user_id;
  
  -- Delete events_old (legacy table with FK to profiles)
  DELETE FROM events_old WHERE created_by = target_user_id;
  
  -- Delete event-related data
  DELETE FROM event_attendees WHERE user_id = target_user_id;
  DELETE FROM event_comments WHERE author_id = target_user_id;
  
  -- Delete community-related data
  DELETE FROM community_memberships WHERE user_id = target_user_id;
  
  -- Delete collaboration data
  DELETE FROM collaboration_memberships WHERE user_id = target_user_id;
  
  -- Delete user roles
  DELETE FROM user_roles WHERE user_id = target_user_id;
  
  -- Delete profile
  DELETE FROM profiles WHERE id = target_user_id;
  
  -- Delete auth user
  DELETE FROM auth.users WHERE id = target_user_id;
END $$;