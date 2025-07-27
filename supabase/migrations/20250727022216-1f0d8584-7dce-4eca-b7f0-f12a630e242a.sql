-- Sample data for testing the post reactions and comments system

-- Profiles
INSERT INTO profiles (id, full_name, avatar_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Amina Diallo', 'https://i.pravatar.cc/150?img=1'),
('22222222-2222-2222-2222-222222222222', 'Kwame Mensah', 'https://i.pravatar.cc/150?img=2');

-- Posts
INSERT INTO posts (author_id, content, media_url, pillar) VALUES
('11111111-1111-1111-1111-111111111111', 'Welcome to DNA! Let''s build Africa''s future together.', null, 'connect'),
('22222222-2222-2222-2222-222222222222', 'Excited to join this platform. Who''s building in fintech?', null, 'collaborate');

-- Comments
INSERT INTO post_comments (post_id, user_id, content) VALUES
((SELECT id FROM posts WHERE author_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), '22222222-2222-2222-2222-222222222222', 'Absolutely! Count me in.'),
((SELECT id FROM posts WHERE author_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), '11111111-1111-1111-1111-111111111111', 'Let''s connect.');

-- Likes/Reactions
INSERT INTO post_reactions (post_id, user_id, emoji) VALUES
((SELECT id FROM posts WHERE author_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), '22222222-2222-2222-2222-222222222222', '❤️'),
((SELECT id FROM posts WHERE author_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), '11111111-1111-1111-1111-111111111111', '👍');