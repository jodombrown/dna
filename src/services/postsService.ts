import { supabase } from '@/integrations/supabase/client';

export interface CreatePostData {
  content: string;
  post_type?: string;
  visibility?: string;
  metadata?: any;
}

export interface Post {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  post_type: string;
  visibility: string;
  metadata: any;
  author: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    profession?: string;
    location?: string;
  };
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

/**
 * Fetch posts with author profiles and engagement counts
 * Filters posts like LinkedIn - shows posts from:
 * 1. User's own posts
 * 2. Posts from accepted connections
 * 3. Public posts from non-connections (deprioritized)
 */
export async function fetchPosts(): Promise<Post[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // If not logged in, only show public posts
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        author_id,
        created_at,
        post_type,
        visibility,
        metadata
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(50);

    if (postsError) throw postsError;
    if (!postsData) return [];

    // Continue with the rest of the logic below...
    const authorIds = [...new Set(postsData.map(p => p.author_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, profession, location')
      .in('id', authorIds);

    const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const postIds = postsData.map(p => p.id);
    const { data: likesData } = await supabase
      .from('post_likes')
      .select('post_id, user_id')
      .in('post_id', postIds);

    const likesMap = new Map<string, { count: number; userLiked: boolean }>();
    likesData?.forEach(like => {
      const current = likesMap.get(like.post_id) || { count: 0, userLiked: false };
      likesMap.set(like.post_id, {
        count: current.count + 1,
        userLiked: current.userLiked || like.user_id === user?.id,
      });
    });

    const { data: commentsData } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds);

    const commentsMap = new Map<string, number>();
    commentsData?.forEach(comment => {
      const count = commentsMap.get(comment.post_id) || 0;
      commentsMap.set(comment.post_id, count + 1);
    });

    return postsData.map(post => {
      const author = profilesMap.get(post.author_id);
      const likes = likesMap.get(post.id) || { count: 0, userLiked: false };
      const commentsCount = commentsMap.get(post.id) || 0;

      return {
        ...post,
        author: author || {
          id: post.author_id,
          username: 'unknown',
          full_name: 'Unknown User',
        },
        likes_count: likes.count,
        comments_count: commentsCount,
        user_has_liked: likes.userLiked,
      };
    });
  }

  // Get user's connections first
  const { data: connectionsData } = await supabase
    .from('connections')
    .select('requester_id, recipient_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

  // Extract connected user IDs
  const connectedUserIds = new Set<string>();
  connectionsData?.forEach(conn => {
    if (conn.requester_id === user.id) {
      connectedUserIds.add(conn.recipient_id);
    } else {
      connectedUserIds.add(conn.requester_id);
    }
  });

  // Fetch posts from:
  // 1. User's own posts
  // 2. Posts from connections
  // 3. Public posts (will be deprioritized in ordering)
  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      author_id,
      created_at,
      post_type,
      visibility,
      metadata
    `)
    .order('created_at', { ascending: false })
    .limit(100); // Fetch more initially to filter

  if (postsError) throw postsError;
  if (!postsData) return [];

  // Fetch author profiles
  const authorIds = [...new Set(postsData.map(p => p.author_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, profession, location')
    .in('id', authorIds);

  const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

  // Fetch likes counts and user's likes
  const postIds = postsData.map(p => p.id);
  const { data: likesData } = await supabase
    .from('post_likes')
    .select('post_id, user_id')
    .in('post_id', postIds);

  const likesMap = new Map<string, { count: number; userLiked: boolean }>();
  likesData?.forEach(like => {
    const current = likesMap.get(like.post_id) || { count: 0, userLiked: false };
    likesMap.set(like.post_id, {
      count: current.count + 1,
      userLiked: current.userLiked || like.user_id === user?.id,
    });
  });

  // Fetch comments counts
  const { data: commentsData } = await supabase
    .from('comments')
    .select('post_id')
    .in('post_id', postIds);

  const commentsMap = new Map<string, number>();
  commentsData?.forEach(comment => {
    const count = commentsMap.get(comment.post_id) || 0;
    commentsMap.set(comment.post_id, count + 1);
  });

  // Filter and prioritize posts
  const filteredPosts = postsData
    .filter(post => {
      // Always show own posts
      if (post.author_id === user.id) return true;
      
      // Show posts from connections
      if (connectedUserIds.has(post.author_id)) return true;
      
      // Show public posts from non-connections (but these will be deprioritized)
      if (post.visibility === 'public') return true;
      
      return false;
    })
    .sort((a, b) => {
      // Prioritization logic (like LinkedIn):
      // 1. Own posts and connection posts first (sorted by date)
      // 2. Public posts from non-connections last (sorted by date)
      
      const aIsOwnOrConnection = a.author_id === user.id || connectedUserIds.has(a.author_id);
      const bIsOwnOrConnection = b.author_id === user.id || connectedUserIds.has(b.author_id);
      
      if (aIsOwnOrConnection && !bIsOwnOrConnection) return -1;
      if (!aIsOwnOrConnection && bIsOwnOrConnection) return 1;
      
      // Within same priority, sort by date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 50); // Limit to 50 posts after filtering and sorting

  // Combine data
  return filteredPosts.map(post => {
    const author = profilesMap.get(post.author_id);
    const likes = likesMap.get(post.id) || { count: 0, userLiked: false };
    const commentsCount = commentsMap.get(post.id) || 0;

    return {
      ...post,
      author: author || {
        id: post.author_id,
        username: 'unknown',
        full_name: 'Unknown User',
      },
      likes_count: likes.count,
      comments_count: commentsCount,
      user_has_liked: likes.userLiked,
    };
  });
}

/**
 * Create a new post
 */
export async function createPost(data: CreatePostData): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('posts').insert({
    author_id: user.id,
    content: data.content,
    post_type: data.post_type || 'status',
    visibility: data.visibility || 'public',
    metadata: data.metadata || {},
  });

  if (error) throw error;
}

/**
 * Like a post
 */
export async function likePost(postId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('post_likes').insert({
    post_id: postId,
    user_id: user.id,
  });

  if (error) throw error;
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', user.id);

  if (error) throw error;
}

/**
 * Create a comment on a post
 */
export async function createComment(postId: string, content: string): Promise<any> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
