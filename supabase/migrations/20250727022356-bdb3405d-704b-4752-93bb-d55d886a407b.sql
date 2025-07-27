-- Sample data for testing - using auth.uid() for current user and a test approach

-- First, let's insert some posts using the current authenticated user if available
-- We'll create posts that can be used for testing reactions and comments

DO $$
DECLARE
    current_user_id UUID;
    test_post_id1 UUID;
    test_post_id2 UUID;
BEGIN
    -- Get current authenticated user ID
    current_user_id := auth.uid();
    
    -- Only proceed if we have an authenticated user
    IF current_user_id IS NOT NULL THEN
        -- Insert test posts
        INSERT INTO posts (author_id, content, media_url, pillar) VALUES
        (current_user_id, 'Welcome to DNA! Let''s build Africa''s future together. 🌍', null, 'connect'),
        (current_user_id, 'Excited to join this platform. Who''s building in fintech? 💰', null, 'collaborate')
        RETURNING id INTO test_post_id1;
        
        -- Get the post IDs for adding sample comments and reactions
        SELECT id INTO test_post_id1 FROM posts WHERE author_id = current_user_id ORDER BY created_at DESC LIMIT 1 OFFSET 1;
        SELECT id INTO test_post_id2 FROM posts WHERE author_id = current_user_id ORDER BY created_at DESC LIMIT 1;
        
        -- Add some sample comments (from the same user for testing)
        INSERT INTO post_comments (post_id, user_id, content) VALUES
        (test_post_id1, current_user_id, 'This is a test comment to showcase the comments system!'),
        (test_post_id2, current_user_id, 'Looking forward to connecting with other entrepreneurs.');
        
        -- Add some sample reactions
        INSERT INTO post_reactions (post_id, user_id, emoji) VALUES
        (test_post_id1, current_user_id, '❤️'),
        (test_post_id2, current_user_id, '👍')
        ON CONFLICT (post_id, user_id, emoji) DO NOTHING;
        
    END IF;
END $$;