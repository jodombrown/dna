import { supabase } from '@/integrations/supabase/client';
import type { CreatePostInput, PostWithAuthor, PostComment, PostLiker } from '@/types/posts';

/**
 * Fetch posts using the optimized RPC function
 * This handles all the complexity of joining with profiles, counting likes/comments,
 * and filtering by connections/privacy
 */
export async function fetchPosts(): Promise<PostWithAuthor[]> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || '00000000-0000-0000-0000-000000000000'; // Fallback for unauthenticated users

  const { data, error } = await supabase.rpc('get_feed_posts', {
    p_user_id: userId,
    p_feed_type: 'all',
    p_hashtag: null,
    p_limit: 50,
    p_offset: 0
  });

  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }

  return (data || []) as unknown as PostWithAuthor[];
}

/**
 * Get a single post with full details
 */
export async function getPostDetails(postId: string): Promise<PostWithAuthor | null> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || '00000000-0000-0000-0000-000000000000';

  const { data, error } = await supabase.rpc('get_post_details', {
    p_post_id: postId,
    p_user_id: userId
  });

  if (error) {
    console.error('Error fetching post details:', error);
    throw error;
  }

  return data as unknown as PostWithAuthor | null;
}

/**
 * Get comments for a post
 */
export async function getPostComments(postId: string): Promise<PostComment[]> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || '00000000-0000-0000-0000-000000000000';

  const { data, error } = await supabase.rpc('get_post_comments', {
    p_post_id: postId,
    p_user_id: userId
  });

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  return (data || []) as PostComment[];
}

/**
 * Get users who liked a post
 */
export async function getPostLikers(postId: string): Promise<PostLiker[]> {
  const { data, error } = await supabase.rpc('get_post_likers', {
    p_post_id: postId
  });

  if (error) {
    console.error('Error fetching likers:', error);
    throw error;
  }

  return data || [];
}

/**
 * Create a new post
 */
export async function createPost(input: CreatePostInput): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('posts').insert({
    author_id: user.id,
    content: input.content,
    post_type: input.post_type,
    privacy_level: input.privacy_level,
    image_url: input.image_url,
    link_url: input.link_url,
    link_title: input.link_title,
    link_description: input.link_description,
  });

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }
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

  if (error && error.code !== '23505') { // Ignore duplicate key errors
    console.error('Error liking post:', error);
    throw error;
  }
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

  if (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
}

/**
 * Delete a post (soft delete)
 */
export async function deletePost(postId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('posts')
    .update({ is_deleted: true })
    .eq('id', postId)
    .eq('author_id', user.id);

  if (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

/**
 * Create a comment on a post
 */
export async function createComment(postId: string, content: string): Promise<any> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    throw error;
  }

  return data;
}

/**
 * Update a comment
 */
export async function updateComment(commentId: string, content: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('post_comments')
    .update({ content })
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('post_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}
