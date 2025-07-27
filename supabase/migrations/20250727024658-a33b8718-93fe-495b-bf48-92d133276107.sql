-- Enable realtime for the social feed system
ALTER TABLE posts REPLICA IDENTITY FULL;
ALTER TABLE post_comments REPLICA IDENTITY FULL;
ALTER TABLE post_reactions REPLICA IDENTITY FULL;
ALTER TABLE post_likes REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE post_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE post_likes;